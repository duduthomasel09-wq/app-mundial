# ADR 0004 — Países e idiomas iniciais

- **Status:** Aprovada (28/09/2026)

## Decisão

- **Idiomas:** `pt-BR`, `en`, `es` (fallback: `en`).
- **Países:** Brasil (BR), Estados Unidos (US), Portugal (PT), Espanha (ES), Reino Unido (GB).
- **Moedas:** BRL, USD, EUR, GBP.

## Consequências

- Unidades: métrico (BR, PT, ES), imperial/US (US), misto (GB) — o usuário pode trocar no perfil.
- Adicionar países/idiomas depois deve exigir só dados e arquivos de tradução, sem mudar código.
