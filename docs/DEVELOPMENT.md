# Guia de desenvolvimento

## Pré-requisitos

- **Node.js 22** (veja `.nvmrc`)
- **pnpm 10** — ative com `corepack enable`
- **Git**
- Para rodar no celular: app **Expo Go** (iPhone/Android)

## Primeiros passos

```bash
git clone https://github.com/duduthomasel09-wq/app-mundial.git
cd app-mundial
corepack enable
pnpm install
```

## Comandos principais (na raiz)

| Comando          | O que faz                                |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Roda app e admin em modo desenvolvimento |
| `pnpm build`     | Gera as versões de produção              |
| `pnpm lint`      | Verifica padrões de código               |
| `pnpm typecheck` | Verifica tipos TypeScript                |
| `pnpm test`      | Roda os testes                           |
| `pnpm format`    | Formata os arquivos                      |

Rodar só um projeto: `pnpm --filter @gfg/mobile dev` ou `pnpm --filter @gfg/admin dev`.

## Rodar o app no celular

1. Instale o app **Expo Go** no celular (App Store / Play Store).
2. No computador, na raiz do projeto: `pnpm --filter @gfg/mobile dev`
3. Escaneie o QR code que aparece no terminal (iPhone: câmera; Android: pelo Expo Go).

> O Expo Go precisa ser compatível com o **SDK 57** do projeto.

## Rodar o painel administrativo

1. Na raiz do projeto: `pnpm --filter @gfg/admin dev`
2. Abra http://localhost:3000 no navegador — vai direto para o Dashboard.
3. (Opcional) Copie `apps/admin/.env.example` para `apps/admin/.env.local` para mudar configurações.

> Por enquanto não há login real: o painel abre em **modo desenvolvimento**.
> Detalhes em [apps/admin/README.md](../apps/admin/README.md).

## Estrutura

```
apps/mobile      App Expo (iOS/Android)
apps/admin       Painel administrativo (Next.js)
packages/core    Tipos e regras compartilhadas
packages/i18n    Traduções (pt-BR, en, es)
packages/ui      Design system mínimo
packages/config  Configurações de TypeScript/lint
supabase/        Banco, migrações e funções
docs/            Documentação e decisões (ADRs)
```

## Convenções

- Nomes de pacotes internos: `@gfg/<nome>`.
- Commits em português, no imperativo: "Adiciona…", "Corrige…".
- Segredos **nunca** no Git — use `.env.local` (veja os arquivos `.env.example`; o painel já tem o seu em `apps/admin/.env.example`, os demais chegam na etapa 9).
