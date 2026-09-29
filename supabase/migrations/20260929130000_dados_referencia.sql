-- =============================================================================
-- Dados de referência: idiomas, moedas e países iniciais (ADR 0004) — ADR 0013
--
-- Antes ficavam em `supabase/seed/01_referencia.sql`. Viraram migration para chegar
-- a TODOS os ambientes (inclusive produção) pelo fluxo normal de migrations — assim o
-- seed pode ser só de desenvolvimento e `--include-seed` nunca é usado em produção.
--
-- IDEMPOTENTE: pode rodar em um banco vazio ou em um banco que já tem estes dados
-- (ex.: o projeto de desenvolvimento, que recebeu o seed antigo). Não apaga nada:
-- insere o que falta e atualiza o que já existe com os mesmos valores.
--
-- Manter igual a packages/core/src/geography.ts.
-- =============================================================================

insert into public.locales (code, name) values
  ('pt-BR', 'Português (Brasil)'),
  ('en', 'English'),
  ('es', 'Español')
on conflict (code) do update set name = excluded.name;

insert into public.currencies (code, symbol, decimals) values
  ('BRL', 'R$', 2),
  ('USD', '$', 2),
  ('EUR', '€', 2),
  ('GBP', '£', 2)
on conflict (code) do update
  set symbol = excluded.symbol,
      decimals = excluded.decimals;

-- Portugal usa pt-BR até existir tradução pt-PT (ADR 0007).
insert into public.countries (code, default_locale, default_currency, unit_system) values
  ('BR', 'pt-BR', 'BRL', 'metric'),
  ('US', 'en', 'USD', 'us'),
  ('PT', 'pt-BR', 'EUR', 'metric'),
  ('ES', 'es', 'EUR', 'metric'),
  ('GB', 'en', 'GBP', 'uk')
on conflict (code) do update
  set default_locale = excluded.default_locale,
      default_currency = excluded.default_currency,
      unit_system = excluded.unit_system;
