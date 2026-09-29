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
| `pnpm test`      | Roda os testes (pacotes compartilhados)  |
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
packages/core    Tipos e regras: países, moedas, planos, unidades
packages/i18n    Traduções (pt-BR, en, es), idioma e formatos
packages/ui      Design system: tokens (@gfg/ui) e componentes do app (@gfg/ui/native)
packages/config  Configurações de TypeScript/lint
supabase/        Banco: migrations, seed e Edge Functions (veja docs/SUPABASE.md)
docs/            Documentação e decisões (ADRs)
```

## Supabase (banco de dados)

A configuração fica em `supabase/`. Para conectar um projeto de desenvolvimento, criar as tabelas
e colocar as chaves públicas nos apps, siga o passo a passo em [SUPABASE.md](SUPABASE.md).

## Pacotes compartilhados

O app e o painel importam os pacotes de `packages/` pelo nome:

```ts
import { convertUnit } from '@gfg/core';
import { formatCurrency } from '@gfg/i18n';
import { getColors } from '@gfg/ui';
```

- Os pacotes são TypeScript puro (sem React) e não têm build: o app e o painel compilam direto.
- Para usar um pacote em outro projeto, adicione `"@gfg/<nome>": "workspace:*"` nas dependências e rode `pnpm install`.
- Cada pacote tem testes: `pnpm --filter @gfg/core test` (ou `pnpm test` para todos).

## Design system (visual)

Cores, fontes, espaçamentos e raios vêm dos **tokens** de `@gfg/ui` — nunca escreva
valores fixos nas telas.

- App: componentes de `@gfg/ui/native` (`Text`, `Button`, `Card`, `Input`, `Badge`, `Divider`).
  Em modo de desenvolvimento, a tela inicial tem o botão **"Ver design system"**.
- Painel: componentes de `apps/admin/src/components/ui` e variáveis CSS (`var(--color-brand)`…).

Detalhes em [packages/ui/README.md](../packages/ui/README.md).

## Traduções (textos da interface)

Nenhum texto da tela fica escrito direto no código: todos estão em
`packages/i18n/locales/` (`pt-BR.json`, `en.json`, `es.json`).

- Para mudar um texto: edite o JSON do idioma.
- Para criar um texto novo: adicione a mesma chave nos três arquivos e rode `pnpm test`.
- O app usa o idioma do celular. O painel usa `ADMIN_LOCALE` (padrão `pt-BR`) — veja `apps/admin/.env.example`.

Detalhes em [packages/i18n/README.md](../packages/i18n/README.md).

## Convenções

- Nomes de pacotes internos: `@gfg/<nome>`.
- Commits em português, no imperativo: "Adiciona…", "Corrige…".
- Segredos **nunca** no Git — use `.env.local` (copie do `.env.example` de cada app). Lista completa de variáveis, ambientes e regras: [ENVIRONMENT.md](ENVIRONMENT.md).
