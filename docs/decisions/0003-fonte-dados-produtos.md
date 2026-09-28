# ADR 0003 — Fonte dos dados de produtos

- **Status:** Aprovada (28/09/2026)

## Decisão

Usar **Open Food Facts** (base aberta e mundial de produtos) como fonte de produtos de supermercado,
com **curadoria própria** para equivalências entre países e substituições.

## Consequências

- Licença ODbL: os dados de produtos do Open Food Facts exigem atribuição e compartilhamento das
  melhorias feitas **nessa base**. Equivalências curadas ficam em tabelas próprias.
- Importação periódica (não chamar a API do Open Food Facts a cada busca do usuário).
- Painel admin precisa de telas de revisão de equivalências.
