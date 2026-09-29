-- =============================================================================
-- Dados de referência: idiomas, moedas e países iniciais (ADR 0004).
--
-- Pode rodar várias vezes sem duplicar nada (upsert).
-- Manter igual a packages/core/src/geography.ts.
-- Nenhum dado de produto, receita ou usuário fica aqui.
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
