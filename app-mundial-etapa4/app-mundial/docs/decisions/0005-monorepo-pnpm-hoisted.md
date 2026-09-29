# ADR 0005 — pnpm com node_modules "hoisted"

- **Status:** Aprovada (28/09/2026) — escopo limitado ao necessário para compatibilidade com o Expo

## Contexto

O React Native (Metro) historicamente tem problemas com a estrutura de links simbólicos padrão do pnpm.

## Decisão

Usar `node-linker=hoisted` no `.npmrc`, que cria um `node_modules` tradicional na raiz.

## Consequências

- Menos erros de "módulo não encontrado" no app Expo.
- Pode ser revisto quando o Expo suportar totalmente o modo isolado do pnpm.
