-- =============================================================================
-- Fundação do banco — Fase 0, etapa 6
--
-- Cria só a base comum:
--   1. extensões de busca (pg_trgm e unaccent);
--   2. função `set_updated_at()` para as próximas tabelas;
--   3. tabelas de referência: idiomas, moedas e países (ADR 0004).
--
-- As tabelas do app (usuários, produtos, receitas, assinaturas…) chegam na Fase 1.
-- Os dados destas tabelas ficam em `supabase/seed/`.
-- =============================================================================

-- 1. Extensões ---------------------------------------------------------------
-- Busca por semelhança ("tomatte" → "tomate") e sem acentos ("acucar" → "açúcar").
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- 2. Atualização automática de `updated_at` ----------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Gatilho: preenche updated_at com a hora atual a cada alteração.';

-- 3. Tabelas de referência -----------------------------------------------------
-- Manter os mesmos códigos de packages/core/src/geography.ts.

create table public.locales (
  code text primary key check (code ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  name text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.locales is 'Idiomas da interface (BCP 47, ex.: pt-BR).';

create table public.currencies (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  symbol text not null,
  decimals smallint not null default 2 check (decimals between 0 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.currencies is 'Moedas (ISO 4217, ex.: BRL).';

create table public.countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  default_locale text not null references public.locales (code),
  default_currency text not null references public.currencies (code),
  unit_system text not null check (unit_system in ('metric', 'us', 'uk')),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.countries is 'Países atendidos (ISO 3166-1 alfa-2, ex.: BR).';

create index countries_default_locale_idx on public.countries (default_locale);
create index countries_default_currency_idx on public.countries (default_currency);

create trigger locales_set_updated_at
  before update on public.locales
  for each row execute function public.set_updated_at();

create trigger currencies_set_updated_at
  before update on public.currencies
  for each row execute function public.set_updated_at();

create trigger countries_set_updated_at
  before update on public.countries
  for each row execute function public.set_updated_at();

-- 4. Segurança (Row Level Security) -------------------------------------------
-- Regra do projeto: RLS ligado em TODAS as tabelas.
-- Estas tabelas são públicas para leitura. Ninguém escreve pela API:
-- só migrations, seed e o painel (no futuro, com papel `admin` verificado no servidor).

alter table public.locales enable row level security;
alter table public.currencies enable row level security;
alter table public.countries enable row level security;

create policy "Idiomas: leitura pública"
  on public.locales for select
  to anon, authenticated
  using (true);

create policy "Moedas: leitura pública"
  on public.currencies for select
  to anon, authenticated
  using (true);

create policy "Países: leitura pública"
  on public.countries for select
  to anon, authenticated
  using (true);
