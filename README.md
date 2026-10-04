# Global Food Guide 🌍 (nome provisório)

Guia alimentar internacional: receitas, produtos de supermercado, equivalentes entre países,
substitutos de ingredientes, tradução de nomes, listas de compras, guia de chás e recursos de viagem.

- 📄 Especificação: [PROJECT_SPEC.md](PROJECT_SPEC.md)
- 🛠️ Como rodar: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 🗄️ Supabase: [docs/SUPABASE.md](docs/SUPABASE.md)
- 🔑 Variáveis de ambiente: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)
- ✅ CI (verificação automática): [docs/CI.md](docs/CI.md)
- 🧭 Ambientes (dev/prod): [docs/AMBIENTES.md](docs/AMBIENTES.md)
- 🧭 Decisões técnicas: [docs/decisions](docs/decisions/README.md)

## Status

✅ **Fase 0 — Fundação**: as 11 etapas estão concluídas e aprovadas.

🚧 **Fase 1 — Núcleo** em andamento:

- ✅ Etapa 1.1 — Usuários, papéis e auditoria no banco (ADR 0015) — aplicada no desenvolvimento
- ✅ Etapa 1.2 — Login real do painel administrativo (ADR 0016)
- 🔎 Etapa 1.3 — Recuperação de senha do painel (ADR 0017) — aguardando revisão

- ✅ Etapa 1 — Estrutura do monorepo
- ✅ Etapa 2 — pnpm + Turborepo
- ✅ Etapa 3 — App Expo (`apps/mobile`, Expo SDK 57)
- ✅ Etapa 4 — Painel administrativo (`apps/admin`, Next.js 16)
- ✅ Etapa 5 — Pacotes compartilhados (`@gfg/core`, `@gfg/i18n`, `@gfg/ui`)
- ✅ Etapa 6 — Configuração inicial do Supabase (`supabase/`)
- ✅ Etapa 7 — Traduções da interface em pt-BR, en e es (`@gfg/i18n`)
- ✅ Etapa 8 — Design system mínimo (`@gfg/ui`, `@gfg/ui/native`, componentes do painel)
- ✅ Etapa 9 — Variáveis de ambiente (`docs/ENVIRONMENT.md`)
- ✅ Etapa 10 — CI com GitHub Actions (`docs/CI.md`)
- ✅ Etapa 11 — Ambientes de desenvolvimento e produção (`docs/AMBIENTES.md`)
