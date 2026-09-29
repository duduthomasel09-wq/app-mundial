# ADR 0007 — Pacotes compartilhados (`@gfg/core`, `@gfg/i18n`, `@gfg/ui`)

- **Status:** Aprovada (29/09/2026) — etapa 5 da Fase 0

## Contexto

O app (`apps/mobile`) e o painel (`apps/admin`) precisam das mesmas regras (países, moedas,
planos, conversão de unidades), dos mesmos formatos por idioma e das mesmas cores.
Copiar isso nos dois lugares geraria diferenças com o tempo.

## Decisão

1. **Três pacotes** em `packages/`, todos `private` e com dependência `workspace:*`:
   - `@gfg/core` — tipos e regras puras: idiomas, países, moedas e unidades iniciais (ADR 0004),
     planos, status de assinatura, papéis, verificação de limites e conversão de unidades;
   - `@gfg/i18n` — escolha do idioma (`resolveLocale`) e formatos de número, moeda e data com `Intl`;
   - `@gfg/ui` — tokens visuais (cores claro/escuro, espaçamentos, cantos, fontes), sem componentes.
2. **Sem etapa de build:** os pacotes são publicados como código-fonte TypeScript (`"main": "./src/index.ts"`).
   O Metro (Expo) e o Next.js (`transpilePackages`) compilam direto. Menos arquivos gerados e
   nenhuma espera por build durante o desenvolvimento.
3. **TypeScript puro, sem React:** os três pacotes funcionam no app, no painel e, no futuro, nas
   Edge Functions do Supabase. Componentes visuais ficam para a etapa 8.
4. **Limites dos planos fora do código:** `@gfg/core` só tem os tipos e a regra
   `isWithinLimit`; os números virão da tabela `Entitlement` (PROJECT_SPEC, seção 6).
5. **Medidas americanas** para `cup`, `tbsp`, `tsp` e `fl_oz` (padrão das receitas dos EUA).
   Peso ↔ volume não é convertido, porque depende da densidade de cada ingrediente.
6. **Portugal usa `pt-BR`** como idioma padrão até existir tradução `pt-PT`.
7. **Testes com Vitest** em cada pacote (`pnpm test`), e ESLint compartilhado em
   `@gfg/config/eslint/library.mjs` (regras recomendadas do ESLint + typescript-eslint).
8. O idioma do app vem de `Intl` (já incluso no React Native), sem nova dependência nativa.
   A detecção completa de idioma (ex.: `expo-localization`) será avaliada na etapa 7.

## Consequências

- Uma regra corrigida em `packages/` vale no app e no painel ao mesmo tempo.
- Os pacotes não podem importar nada de `apps/` nem de bibliotecas de uma plataforma só.
- As listas de países/moedas/idiomas daqui serão a semente das tabelas do Supabase (etapa 6).
