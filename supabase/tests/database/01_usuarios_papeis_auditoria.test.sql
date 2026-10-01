-- =============================================================================
-- Testes (pgTAP) — usuários, papéis e auditoria (migration 20260930120000, ADR 0015)
--
-- Rodam com `supabase test db` num Supabase local (CI: job "Banco de dados").
-- Tudo acontece dentro de uma transação desfeita no final: nada fica gravado.
-- Os usuários abaixo são FICTÍCIOS, criados só para o teste.
-- =============================================================================
begin;

create extension if not exists pgtap with schema extensions;

select plan(64);

-- ---------------------------------------------------------------------------
-- Auxiliares: entrar como um usuário (papel authenticated) ou como anônimo.
-- ---------------------------------------------------------------------------
create function pg_temp.login_as(p_user uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.login_anon() returns void language sql as $$
  select set_config('role', 'anon', true),
         set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;

create function pg_temp.logout() returns void language sql as $$
  select set_config('role', 'postgres', true),
         set_config('request.jwt.claims', '', true);
$$;

-- Usuários fictícios.
--   A: cadastro completo (pt-BR, BR)   B: cadastro com metadados inválidos
--   C: sem metadados                   E: editor    D: admin
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@teste.local',
   '{"locale":"pt-BR","country_code":"br","display_name":"  Ana  "}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@teste.local',
   '{"locale":"fr","country_code":"XX","display_name":""}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@teste.local', null),
  ('00000000-0000-0000-0000-00000000000e', 'e@teste.local', '{"locale":"es","country_code":"ES"}'),
  ('00000000-0000-0000-0000-00000000000d', 'd@teste.local', '{"locale":"en","country_code":"GB"}');

-- Papéis iniciais concedidos "pelo dono do projeto" (SQL direto, como o primeiro admin).
insert into public.user_roles (user_id, role) values
  ('00000000-0000-0000-0000-00000000000e', 'editor'),
  ('00000000-0000-0000-0000-00000000000d', 'admin');

-- ---------------------------------------------------------------------------
-- 1. Estrutura
-- ---------------------------------------------------------------------------
select has_table('public', 'profiles', 'tabela profiles existe');
select has_table('public', 'user_roles', 'tabela user_roles existe');
select has_table('public', 'audit_log', 'tabela audit_log existe');
select enum_has_labels('public', 'app_role', array['editor', 'admin'], 'app_role = editor | admin');
select has_function('public', 'has_role', array['app_role'], 'has_role(app_role) existe');
select ok(
  (select bool_and(relrowsecurity) from pg_class
   where oid in ('public.profiles'::regclass, 'public.user_roles'::regclass, 'public.audit_log'::regclass)),
  'RLS ligado em profiles, user_roles e audit_log'
);
select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('has_role', 'handle_new_user', 'audit_row_change', 'protect_last_admin',
                       'protect_last_admin_account', 'prevent_user_roles_truncate',
                       'other_active_admin_exists')
     and p.prosecdef
     and exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')),
  7,
  'funções security definer têm search_path fixo'
);

-- ---------------------------------------------------------------------------
-- 2. Criação automática do perfil (gatilho em auth.users)
-- ---------------------------------------------------------------------------
select is((select count(*)::int from public.profiles), 5, 'um perfil por usuário cadastrado');

select row_eq(
  $$ select locale, country_code, currency_code, unit_system, display_name, onboarding_completed_at
     from public.profiles where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  row('pt-BR'::text, 'BR'::text, 'BRL'::text, 'metric'::text, 'Ana'::text, null::timestamptz),
  'metadados válidos: idioma, país, moeda e unidades derivadas do país; nome sem espaços'
);

select row_eq(
  $$ select locale, country_code, currency_code, unit_system, display_name
     from public.profiles where user_id = '00000000-0000-0000-0000-00000000000b' $$,
  row('en'::text, null::text, null::text, null::text, null::text),
  'metadados inválidos: locale en e país/moeda/unidades vazios (cadastro não falha)'
);

select row_eq(
  $$ select locale, country_code from public.profiles where user_id = '00000000-0000-0000-0000-00000000000c' $$,
  row('en'::text, null::text),
  'sem metadados: locale en'
);

select row_eq(
  $$ select currency_code, unit_system from public.profiles where user_id = '00000000-0000-0000-0000-00000000000d' $$,
  row('GBP'::text, 'uk'::text),
  'GB → GBP e sistema uk'
);

select throws_ok(
  $$ update public.profiles set onboarding_completed_at = now()
     where user_id = '00000000-0000-0000-0000-00000000000b' $$,
  '23514', null,
  'onboarding não pode ser concluído sem país, moeda e unidades'
);

-- ---------------------------------------------------------------------------
-- 3. Anônimo: não vê dados de usuários; continua vendo dados de referência
-- ---------------------------------------------------------------------------
select pg_temp.login_anon();

select throws_ok('select * from public.profiles', '42501', null, 'anon não lê profiles');
select throws_ok('select * from public.user_roles', '42501', null, 'anon não lê user_roles');
select throws_ok('select * from public.audit_log', '42501', null, 'anon não lê audit_log');
select is((select count(*)::int from public.countries), 5, 'anon continua lendo countries');
select is(public.has_role('editor'), false, 'has_role é false para anon');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 4. Usuário comum (A)
-- ---------------------------------------------------------------------------
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');

select is((select count(*)::int from public.profiles), 1, 'usuário comum vê só o próprio perfil');
select is(
  (select user_id from public.profiles),
  '00000000-0000-0000-0000-00000000000a'::uuid,
  'o perfil visível é o dele'
);

select lives_ok(
  $$ update public.profiles set display_name = 'Ana Maria', onboarding_completed_at = now()
     where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  'usuário altera o próprio perfil e conclui o onboarding'
);

update public.profiles set display_name = 'invasão' where user_id = '00000000-0000-0000-0000-00000000000b';
select pg_temp.logout();
select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-00000000000b'),
  null,
  'usuário comum não altera o perfil de outro (0 linhas afetadas)'
);
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');

select throws_ok(
  $$ update public.profiles set user_id = '00000000-0000-0000-0000-00000000000c'
     where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501', null,
  'usuário não altera user_id (permissão por coluna)'
);
select throws_ok(
  $$ update public.profiles set created_at = now() where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501', null,
  'usuário não altera created_at'
);
select throws_ok(
  $$ insert into public.profiles (user_id) values ('00000000-0000-0000-0000-0000000000ff') $$,
  '42501', null,
  'usuário não cria perfis pela API'
);
select throws_ok(
  $$ delete from public.profiles where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501', null,
  'usuário não apaga perfis pela API'
);

select is(public.has_role('editor'), false, 'usuário comum não é editor');
select is(public.has_role('admin'), false, 'usuário comum não é admin');
select is((select count(*)::int from public.user_roles), 0, 'usuário comum não vê papéis de ninguém');
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-00000000000a', 'admin') $$,
  '42501', null,
  'usuário comum NÃO consegue se dar o papel admin'
);
select is((select count(*)::int from public.audit_log), 0, 'usuário comum não lê o audit_log');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 5. Editor (E)
-- ---------------------------------------------------------------------------
select pg_temp.login_as('00000000-0000-0000-0000-00000000000e');

select is(public.has_role('editor'), true, 'editor tem o papel editor');
select is(public.has_role('admin'), false, 'editor não é admin');
select is((select count(*)::int from public.user_roles), 1, 'editor vê só o próprio papel');
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-00000000000a', 'editor') $$,
  '42501', null,
  'editor não concede papéis'
);
select is((select count(*)::int from public.profiles), 1, 'editor não lê perfis de outros');

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 6. Admin (D)
-- ---------------------------------------------------------------------------
select pg_temp.login_as('00000000-0000-0000-0000-00000000000d');

select is(public.has_role('admin'), true, 'admin tem o papel admin');
select is(public.has_role('editor'), true, 'admin também vale como editor (hierarquia)');
select is((select count(*)::int from public.profiles), 5, 'admin lê todos os perfis');

select lives_ok(
  $$ insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-00000000000a', 'editor') $$,
  'admin concede o papel editor'
);
select is(
  (select granted_by from public.user_roles
   where user_id = '00000000-0000-0000-0000-00000000000a' and role = 'editor'),
  '00000000-0000-0000-0000-00000000000d'::uuid,
  'granted_by é preenchido com o admin da sessão'
);
select throws_ok(
  $$ insert into public.user_roles (user_id, role, granted_by)
     values ('00000000-0000-0000-0000-00000000000c', 'editor', '00000000-0000-0000-0000-00000000000a') $$,
  '42501', null,
  'ninguém escolhe o granted_by pela API'
);

select lives_ok(
  $$ delete from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000a' and role = 'editor' $$,
  'admin remove um papel'
);

-- Auditoria das duas operações acima.
select results_eq(
  $$ select action, actor_id, record_id from public.audit_log
     where table_name = 'user_roles' and record_id = '00000000-0000-0000-0000-00000000000a'
     order by id $$,
  $$ values ('insert'::text, '00000000-0000-0000-0000-00000000000d'::uuid, '00000000-0000-0000-0000-00000000000a'::text),
            ('delete'::text, '00000000-0000-0000-0000-00000000000d'::uuid, '00000000-0000-0000-0000-00000000000a'::text) $$,
  'concessão e remoção ficam no audit_log com o autor certo'
);

-- Auditoria é imutável, até para admin.
select throws_ok('delete from public.audit_log', '42501', null, 'admin não apaga o audit_log');
select throws_ok(
  $$ update public.audit_log set action = 'insert' $$, '42501', null, 'admin não altera o audit_log'
);
select throws_ok(
  $$ insert into public.audit_log (action, table_name) values ('insert', 'x') $$,
  '42501', null,
  'ninguém grava no audit_log pela API'
);

-- Último admin protegido.
select throws_ok(
  $$ delete from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000d' and role = 'admin' $$,
  'P0001', 'Não é possível remover o último admin.',
  'o último admin não pode ser removido'
);

select pg_temp.logout();

-- ---------------------------------------------------------------------------
-- 7. Excluir um usuário em auth.users apaga perfil e papéis; a auditoria continua
-- ---------------------------------------------------------------------------
delete from auth.users where id = '00000000-0000-0000-0000-00000000000e';
select is(
  (select count(*)::int from public.profiles where user_id = '00000000-0000-0000-0000-00000000000e')
  + (select count(*)::int from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000e'),
  0,
  'perfil e papéis somem junto com o usuário (cascade)'
);

-- ---------------------------------------------------------------------------
-- 8. O sistema nunca fica sem admin ATIVO (exclusão da conta, exclusão "suave", TRUNCATE)
--    Neste ponto, D é o único admin. Comandos como postgres (dono do banco).
-- ---------------------------------------------------------------------------
create function pg_temp.active_admins() returns int language sql as $$
  select count(*)::int from public.user_roles r join auth.users u on u.id = r.user_id
  where r.role = 'admin' and u.deleted_at is null;
$$;

select throws_ok(
  $$ delete from auth.users where id = '00000000-0000-0000-0000-00000000000d' $$,
  'P0001', 'Não é possível excluir a conta do último admin.',
  'excluir em auth.users a conta do último admin é bloqueado'
);
select is(pg_temp.active_admins(), 1, '... e o admin continua existindo (o CASCADE não rodou)');

select throws_ok(
  $$ update auth.users set deleted_at = now() where id = '00000000-0000-0000-0000-00000000000d' $$,
  'P0001', 'Não é possível excluir a conta do último admin.',
  'exclusão "suave" (deleted_at) do último admin é bloqueada'
);

select throws_ok(
  'truncate public.user_roles',
  'P0001', 'Não é possível esvaziar user_roles: o sistema ficaria sem admin.',
  'TRUNCATE em user_roles é bloqueado enquanto houver admin'
);
select throws_ok(
  'truncate auth.users cascade',
  'P0001', 'Não é possível esvaziar user_roles: o sistema ficaria sem admin.',
  'TRUNCATE ... CASCADE em auth.users também é bloqueado'
);
select is(pg_temp.active_admins(), 1, 'depois das tentativas, continua havendo 1 admin ativo');

-- Com um segundo admin (F), excluir a conta de D é permitido (o CASCADE continua valendo).
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f1', 'f@teste.local');
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000f1', 'admin');

select lives_ok(
  $$ delete from auth.users where id = '00000000-0000-0000-0000-00000000000d' $$,
  'com outro admin ativo, a conta de um admin pode ser excluída'
);
select is(
  (select count(*)::int from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000d'),
  0,
  '... e os papéis dela somem pelo CASCADE'
);

-- Agora F é o último admin: revogar o papel direto (como dono do banco) também é bloqueado.
select throws_ok(
  $$ delete from public.user_roles where user_id = '00000000-0000-0000-0000-0000000000f1' and role = 'admin' $$,
  'P0001', 'Não é possível remover o último admin.',
  'revogar o papel do último admin é bloqueado (também fora da API)'
);

-- Um admin com a conta excluída "suavemente" não conta como admin ativo.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a2', 'g@teste.local');
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000a2', 'admin');
select lives_ok(
  $$ update auth.users set deleted_at = now() where id = '00000000-0000-0000-0000-0000000000a2' $$,
  'com outro admin ativo, a exclusão "suave" de um admin é permitida'
);
select throws_ok(
  $$ delete from auth.users where id = '00000000-0000-0000-0000-0000000000f1' $$,
  'P0001', 'Não é possível excluir a conta do último admin.',
  'admin excluído "suavemente" não conta: F continua sendo o último admin ativo'
);
select throws_ok(
  $$ delete from public.user_roles where user_id = '00000000-0000-0000-0000-0000000000f1' and role = 'admin' $$,
  'P0001', 'Não é possível remover o último admin.',
  '... nem o papel de F pode ser revogado'
);

-- Apagar os dois admins ativos de uma vez, num só comando, também é bloqueado.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a3', 'h@teste.local');
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000a3', 'admin');
select throws_ok(
  $$ delete from auth.users
     where id in ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000a3') $$,
  'P0001', null,
  'excluir todos os admins ativos num único comando é bloqueado'
);
select throws_ok(
  $$ delete from public.user_roles where role = 'admin' $$,
  'P0001', 'Não é possível remover o último admin.',
  'revogar todos os admins num único comando é bloqueado'
);
select is(pg_temp.active_admins(), 2, 'no fim, os 2 admins ativos continuam existindo');

select * from finish();
rollback;
