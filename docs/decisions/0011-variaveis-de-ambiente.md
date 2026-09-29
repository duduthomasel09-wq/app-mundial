# ADR 0011 — Variáveis de ambiente

- **Status:** Aprovada (29/09/2026) — etapa 9 da Fase 0

## Contexto

O painel lia suas variáveis em `apps/admin/src/lib/env.ts`, aceitando valores inválidos em
silêncio; o app documentava variáveis que não lia; o `turbo.json` citava variáveis e arquivos
que não existem (`APP_ENV`, `.env` na raiz). O projeto precisa de uma convenção única para
`development`, `staging` e `production`, sem nenhum segredo no Git.

## Decisão

1. **Três ambientes:** `development` (padrão), `staging` (= teste/homologação) e `production`.
   Testes automáticos rodam como `development`.
2. **Nomes:** prefixo `NEXT_PUBLIC_` (painel) e `EXPO_PUBLIC_` (app) para o que é público;
   sem prefixo para o que é só do servidor. As chaves públicas do Supabase continuam
   `..._SUPABASE_ANON_KEY` (aceitam a "publishable key" nova ou a "anon key" antiga) —
   sem renomear nesta etapa.
3. **Validação em `@gfg/core`** (`src/env.ts`), TypeScript puro, sem biblioteca de validação:
   padrão para valor ausente; padrão + aviso para valor inválido; URL verificada; chave
   secreta do Supabase em variável pública é descartada com erro; vazios em produção geram aviso.
   Avisos mostram só o nome da variável, nunca o valor.
4. **Um único ponto de leitura por app:** `apps/admin/src/lib/env.ts` e
   `apps/mobile/src/lib/env.ts`, sempre com `process.env.NOME` por extenso.
5. **`ADMIN_AUTH_MODE=disabled` em produção gera só aviso.** O bloqueio continua sendo da
   etapa 11, como definido na ADR 0006.
6. **Modelos versionados, valores fora do Git:** `apps/admin/.env.example`,
   `apps/mobile/.env.example`, `supabase/functions/.env.example` e `supabase/.env.example`
   (referência das variáveis do CLI). Valores reais: `.env.local` (dev) ou configurações da
   hospedagem / serviço de build / `supabase secrets set` (staging e produção).
7. **`turbo.json`:** remove `APP_ENV` e `.env` da raiz (não existem) e inclui `EXPO_PUBLIC_*`
   no cache do build.
8. **Documentação única:** `docs/ENVIRONMENT.md`.

## Consequências

- Uma variável errada não derruba o app, mas aparece no terminal.
- A verificação de chave secreta é um alarme, não uma proteção completa (as variáveis públicas
  já estão no build quando o código roda) — a regra continua sendo nunca colocá-las ali.
- Novas variáveis devem entrar ao mesmo tempo no `env.ts` do app, no `.env.example`, no
  `docs/ENVIRONMENT.md` e, se afetarem o build, no `turbo.json`.
