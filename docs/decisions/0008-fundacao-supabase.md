# ADR 0008 — Fundação do Supabase

- **Status:** Proposta (29/09/2026) — aguardando aprovação na etapa 6 da Fase 0

## Contexto

O Supabase foi aprovado como backend (ADR 0001). Antes das tabelas do app (Fase 1), é preciso
uma estrutura versionada para o banco, os dados iniciais e as Edge Functions, e um caminho
claro para conectar um projeto de desenvolvimento — sem nenhuma chave no Git.

## Decisão

1. **Estrutura padrão do Supabase CLI** em `supabase/`: `config.toml`, `migrations/`, `seed/`
   e `functions/`. O CLI é usado via `npx supabase` (sem instalação extra; nada foi adicionado
   ao `package.json`).
2. **Postgres 17** no ambiente local (`major_version = 17`), igual aos projetos novos na nuvem.
3. **Primeira migration mínima** (`20260929120000_fundacao.sql`):
   - extensões `pg_trgm` e `unaccent` no esquema `extensions` (busca da seção 3.1 do PROJECT_SPEC);
   - função `set_updated_at()` para reuso nas próximas tabelas;
   - só as **tabelas de referência** `locales`, `currencies` e `countries` — nenhuma tabela de
     usuários, produtos, receitas ou assinaturas.
4. **Row Level Security em todas as tabelas.** As de referência têm só leitura pública; nenhuma
   política de escrita (quem escreve são migrations, seed e, no futuro, o admin pelo servidor).
5. **Dados de referência no seed** (`seed/01_referencia.sql`), com _upsert_ (pode rodar várias vezes).
   No local rodam no `db reset`; na nuvem, com `db push --include-seed`. Os códigos seguem
   `@gfg/core` (ADR 0007).
6. **Edge Functions em Deno** com uma função `health` sem regra de negócio e com
   `verify_jwt = false` (é pública e não expõe dados). Código comum em `functions/_shared/`.
7. **Variáveis de ambiente:** `apps/mobile/.env.example` (`EXPO_PUBLIC_*`) e
   `supabase/functions/.env.example`, além do `apps/admin/.env.example` que já existia.
   Só chaves **públicas** nos apps; a chave `service_role`/`secret` nunca vai para os apps.
8. **Projeto de desenvolvimento na nuvem** como caminho principal (Supabase local com Docker
   é opcional), porque o Docker Desktop é pesado para o dia a dia no Windows.

## Limitação desta etapa

O ambiente onde a etapa foi feita não permitia baixar o Supabase CLI nem o Deno (rede bloqueada)
e não tinha Docker ativo. Por isso:

- a migration e o seed foram testados num **PostgreSQL 16** temporário, simulando os papéis
  `anon`/`authenticated` do Supabase (tabelas, dados, RLS, gatilho e extensões funcionaram);
- a Edge Function passou por verificação de tipos do TypeScript, mas não foi executada no Deno;
- o `config.toml` segue o formato documentado do CLI, mas ainda não foi lido pelo CLI.

**Atualização (29/09/2026):** a migration e o seed foram aplicados com sucesso no projeto
de desenvolvimento real (`global-food-guide-dev`) pelo SQL Editor do site — ver
docs/SUPABASE.md, seção 2.3-B. Como esse caminho não registra a migration no histórico do CLI,
o primeiro uso do CLI deve começar com
`npx supabase migration repair --status applied 20260929120000`.
O `config.toml` e a Edge Function continuam sem ter sido executados pelo CLI/Deno.

## Consequências

- Toda mudança no banco passa a ser uma migration versionada no Git.
- As tabelas do app entram na Fase 1 como novas migrations, reutilizando `set_updated_at()`.
- Quando o CI existir (etapa 10), ele poderá validar as migrations automaticamente.
