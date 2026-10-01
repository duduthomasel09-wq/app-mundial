-- =============================================================================
-- Usuários, papéis e auditoria — Fase 1, etapa 1.1 (ADR 0015)
--
--   1. tipo app_role ('editor' | 'admin') — sem linha em user_roles = usuário comum ('user');
--   2. profiles: um por usuário, criado automaticamente no cadastro (auth.users);
--   3. user_roles: papéis elevados; só admin concede/remove; o último admin ATIVO é protegido
--      contra revogação, exclusão da conta (inclusive em cascata), exclusão "suave"
--      (auth.users.deleted_at) e TRUNCATE;
--   4. audit_log: registro imutável; nesta etapa audita user_roles;
--   5. has_role(): verificação de papel usada nas políticas (admin inclui editor);
--   6. RLS em todas as tabelas + permissões por coluna.
--
-- Regras de segurança (ADR 0013/0015): nenhuma política depende de service_role;
-- funções security definer com search_path vazio e nomes completos.
-- =============================================================================

-- 1. Papéis elevados -----------------------------------------------------------
create type public.app_role as enum ('editor', 'admin');

comment on type public.app_role is
  'Papéis elevados. Sem linha em user_roles = usuário comum (papel "user" do PROJECT_SPEC).';

-- 2. Perfis ----------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (
    display_name is null or char_length(btrim(display_name)) between 1 and 80
  ),
  locale text not null default 'en' references public.locales (code),
  country_code text references public.countries (code),
  currency_code text references public.currencies (code),
  unit_system text check (unit_system in ('metric', 'us', 'uk')),
  -- Sem lista fechada por enquanto (ADR 0015, H5).
  dietary_preferences text[] not null default '{}',
  -- Onboarding obrigatório: preenchido quando o usuário confirma idioma, país e moeda.
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_onboarding_complete check (
    onboarding_completed_at is null
    or (country_code is not null and currency_code is not null and unit_system is not null)
  )
);

comment on table public.profiles is
  'Perfil do usuário (idioma, país, moeda, unidades). Criado pelo gatilho on_auth_user_created.';

create index profiles_country_code_idx on public.profiles (country_code);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3. Papéis ----------------------------------------------------------------------
create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  -- Quem concedeu: sempre o usuário da sessão (o cliente não pode escolher este campo).
  granted_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is
  'Papéis editor/admin. Só admin concede ou remove (RLS). O último admin não pode ser removido.';

-- 4. Auditoria -------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb
);

comment on table public.audit_log is
  'Registro imutável de alterações feitas pelo painel (PROJECT_SPEC 3.4). Só admin lê.';

create index audit_log_target_idx on public.audit_log (table_name, record_id);
create index audit_log_occurred_at_idx on public.audit_log (occurred_at desc);

-- 5. Funções -----------------------------------------------------------------------

-- Verifica se o usuário da sessão tem o papel pedido. `admin` também vale como `editor`.
create function public.has_role(p_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and (ur.role = p_role or (p_role = 'editor' and ur.role = 'admin'))
  );
$$;

comment on function public.has_role(public.app_role) is
  'true se o usuário da sessão tem o papel (admin inclui editor). Anônimo: false.';

-- Cria o perfil no cadastro. Lê locale/country_code/display_name dos metadados enviados
-- pelo app no signUp, VALIDA contra as tabelas de referência e nunca bloqueia o cadastro.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_locale text := v_meta ->> 'locale';
  v_country text := upper(nullif(btrim(v_meta ->> 'country_code'), ''));
  v_currency text;
  v_units text;
  v_name text := nullif(btrim(v_meta ->> 'display_name'), '');
begin
  if v_locale is null
     or not exists (
       select 1 from public.locales l where l.code = v_locale and l.is_enabled
     ) then
    v_locale := 'en';
  end if;

  -- País válido → moeda e unidades derivadas do país; inválido/ausente → tudo vazio.
  select c.code, c.default_currency, c.unit_system
    into v_country, v_currency, v_units
  from public.countries c
  where c.code = v_country and c.is_enabled;

  if not found then
    v_country := null;
    v_currency := null;
    v_units := null;
  end if;

  v_name := left(v_name, 80);

  insert into public.profiles (user_id, display_name, locale, country_code, currency_code, unit_system)
  values (new.id, v_name, v_locale, v_country, v_currency, v_units)
  on conflict (user_id) do nothing;

  return new;
exception
  when others then
    -- Nunca impedir o cadastro por causa de metadados: cria o perfil mínimo.
    insert into public.profiles (user_id) values (new.id) on conflict (user_id) do nothing;
    return new;
end;
$$;

-- Registra no audit_log. Argumento do gatilho: nome da coluna usada como record_id.
create function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
begin
  insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    coalesce(v_new, v_old) ->> tg_argv[0],
    v_old,
    v_new
  );
  return coalesce(new, old);
end;
$$;

-- Último admin -----------------------------------------------------------------
-- "Admin ativo" = linha 'admin' em user_roles cuja conta existe e não foi excluída
-- (auth.users.deleted_at vazio). O sistema nunca pode ficar com zero admins ativos.

-- true se existe OUTRO admin ativo além de p_user_id. Trava as linhas de admin para que
-- duas remoções simultâneas não passem juntas (a segunda espera e vê o resultado da primeira).
create function public.other_active_admin_exists(p_user_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform 1 from public.user_roles where role = 'admin' for update;

  return exists (
    select 1
    from public.user_roles r
    join auth.users u on u.id = r.user_id
    where r.role = 'admin'
      and r.user_id <> p_user_id
      and u.deleted_at is null
  );
end;
$$;

-- user_roles: impede revogar (ou rebaixar) o último admin ativo. Também dispara quando a
-- conta é apagada em auth.users, porque o CASCADE apaga as linhas de user_roles.
create function public.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'admin'
     and (tg_op = 'DELETE' or new.role <> 'admin' or new.user_id <> old.user_id)
     and not public.other_active_admin_exists(old.user_id) then
    raise exception 'Não é possível remover o último admin.'
      using errcode = 'P0001',
            hint = 'Conceda o papel admin a outro usuário antes.';
  end if;

  return coalesce(new, old);
end;
$$;

-- auth.users: impede apagar a conta do último admin ativo ou marcá-la como excluída
-- (exclusão "suave" do Supabase Auth). Barra antes do CASCADE, com mensagem clara.
create function public.protect_last_admin_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE' or (old.deleted_at is null and new.deleted_at is not null))
     and exists (
       select 1 from public.user_roles r where r.user_id = old.id and r.role = 'admin'
     )
     and not public.other_active_admin_exists(old.id) then
    raise exception 'Não é possível excluir a conta do último admin.'
      using errcode = 'P0001',
            hint = 'Conceda o papel admin a outro usuário antes.';
  end if;

  return coalesce(new, old);
end;
$$;

-- TRUNCATE não dispara gatilhos por linha: bloqueia esvaziar user_roles (inclusive por
-- TRUNCATE ... CASCADE em auth.users) enquanto houver algum admin.
create function public.prevent_user_roles_truncate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.user_roles where role = 'admin') then
    raise exception 'Não é possível esvaziar user_roles: o sistema ficaria sem admin.'
      using errcode = 'P0001';
  end if;

  return null;
end;
$$;

-- Funções de gatilho não são chamadas diretamente por ninguém.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.audit_row_change() from public, anon, authenticated;
revoke all on function public.protect_last_admin() from public, anon, authenticated;
revoke all on function public.protect_last_admin_account() from public, anon, authenticated;
revoke all on function public.prevent_user_roles_truncate() from public, anon, authenticated;
revoke all on function public.other_active_admin_exists(uuid) from public, anon, authenticated;

revoke all on function public.has_role(public.app_role) from public;
grant execute on function public.has_role(public.app_role) to anon, authenticated, service_role;

-- 6. Gatilhos -----------------------------------------------------------------------
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger user_roles_protect_last_admin
  before update or delete on public.user_roles
  for each row execute function public.protect_last_admin();

create trigger user_roles_prevent_truncate
  before truncate on public.user_roles
  for each statement execute function public.prevent_user_roles_truncate();

create trigger on_auth_user_delete_protect_last_admin
  before delete or update of deleted_at on auth.users
  for each row execute function public.protect_last_admin_account();

create trigger user_roles_audit
  after insert or update or delete on public.user_roles
  for each row execute function public.audit_row_change('user_id');

-- 7. RLS e permissões ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;

-- Permissões explícitas (o Supabase dá "all" por padrão; a RLS e estas regras restringem).
revoke all on public.profiles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
revoke all on public.audit_log from anon, authenticated;

-- profiles: ler (filtrado pela RLS) e alterar só as colunas editáveis. Sem insert/delete
-- pela API: o gatilho cria; a exclusão vem do cascade de auth.users.
grant select on public.profiles to authenticated;
grant update (
  display_name,
  locale,
  country_code,
  currency_code,
  unit_system,
  dietary_preferences,
  onboarding_completed_at
) on public.profiles to authenticated;

-- user_roles: ler, conceder (só user_id e role — granted_by é sempre a sessão) e remover.
grant select, delete on public.user_roles to authenticated;
grant insert (user_id, role) on public.user_roles to authenticated;

-- audit_log: só leitura (filtrada pela RLS). Ninguém grava/altera/apaga pela API.
grant select on public.audit_log to authenticated;

create policy "Perfis: o dono e admins leem"
  on public.profiles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.has_role('admin')));

create policy "Perfis: o dono altera o próprio"
  on public.profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Papéis: o próprio usuário e admins leem"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.has_role('admin')));

create policy "Papéis: só admin concede"
  on public.user_roles for insert
  to authenticated
  with check ((select public.has_role('admin')));

create policy "Papéis: só admin remove"
  on public.user_roles for delete
  to authenticated
  using ((select public.has_role('admin')));

create policy "Auditoria: só admin lê"
  on public.audit_log for select
  to authenticated
  using ((select public.has_role('admin')));
