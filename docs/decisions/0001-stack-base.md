# ADR 0001 — Base técnica

- **Status:** Aprovada (28/09/2026)
- **Decisão de:** Eduardo (dono do produto)

## Contexto

O app precisa rodar em iPhone e Android, ter painel administrativo, banco relacional, autenticação,
assinaturas nas lojas, analytics e suporte a vários idiomas — com uma equipe pequena.

## Decisão

| Camada       | Tecnologia                                         |
| ------------ | -------------------------------------------------- |
| Linguagem    | TypeScript (em todo o projeto)                     |
| App          | Expo + React Native + Expo Router                  |
| Painel admin | Next.js                                            |
| Backend      | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Assinaturas  | RevenueCat                                         |
| Analytics    | PostHog                                            |
| Monorepo     | pnpm + Turborepo                                   |

## Consequências

- Um único idioma de programação e tipos compartilhados entre app, admin e servidor.
- Dependência de serviços gerenciados (Supabase, RevenueCat, PostHog) — todos têm plano gratuito para começar.
- Regras de acesso ficam no banco (Row Level Security), não só no app.
