-- =============================================================================
-- Seed — SOMENTE DESENVOLVIMENTO (ADR 0013)
--
-- Este diretório é para dados FICTÍCIOS de teste (ex.: receitas e produtos de exemplo).
-- Roda automaticamente no `npx supabase db reset` (ambiente local) e, no projeto de
-- desenvolvimento, com `npx supabase db push --include-seed`.
--
-- ⚠️ `--include-seed` é PROIBIDO em produção. Nada daqui pode ir para usuários reais.
--
-- Os dados de referência (idiomas, moedas, países) que ficavam aqui agora estão na
-- migration `20260929130000_dados_referencia.sql` e chegam a todos os ambientes.
--
-- Por enquanto não há dados de exemplo: eles chegam com as tabelas do app (Fase 1).
-- =============================================================================

select 1; -- sem dados por enquanto
