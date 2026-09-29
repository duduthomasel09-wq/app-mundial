# apps/admin — Painel administrativo

Painel do **Global Food Guide** (`@gfg/admin`), feito com **Next.js 16 + TypeScript**.
Serve para a equipe gerenciar o conteúdo do app. Nesta fase existe só a **fundação técnica**:
nenhum cadastro, banco de dados ou login real.

## Rodar

```bash
# na raiz do monorepo
pnpm install
pnpm --filter @gfg/admin dev
```

Abra http://localhost:3000 → vai direto para o **Dashboard**.

## Rotas

| Rota         | O que é                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| `/`          | Redireciona para `/dashboard`                                            |
| `/login`     | Tela de login (visual pronto, formulário desativado até o Supabase Auth) |
| `/dashboard` | Tela inicial do painel, com menu lateral das áreas futuras ("Em breve")  |

## Estrutura

```
apps/admin
├── .env.example            Modelo das variáveis de ambiente (sem chaves reais)
├── eslint.config.mjs       ESLint (regras do Next.js + TypeScript)
├── next.config.ts          Configuração do Next.js (pacotes compartilhados)
├── package.json
├── tsconfig.json           Estende @gfg/config/typescript/nextjs.json
└── src
    ├── app
    │   ├── layout.tsx          Layout raiz (HTML, título, estilos globais)
    │   ├── globals.css         Estilos base (cores e medidas vêm dos tokens de @gfg/ui)
    │   ├── icon.svg            Ícone da aba do navegador
    │   ├── page.tsx            "/" → redireciona para /dashboard
    │   ├── (auth)/login/       Tela de login
    │   └── (painel)/           Área protegida (exige sessão)
    │       ├── layout.tsx      Menu lateral + verificação de sessão
    │       └── dashboard/      Tela inicial
    ├── components
    │   ├── Sidebar.tsx         Menu lateral
    │   └── ui/                 Design system web: Text, Button, Card, Input, Badge, Divider
    ├── config
    │   └── navigation.ts       Itens do menu (só Dashboard ativo)
    └── lib
        ├── env.ts              Leitura das variáveis de ambiente
        ├── i18n.ts             Traduções do painel (idioma de ADMIN_LOCALE)
        └── auth/               Estrutura de autenticação (sem Supabase ainda)
```

> `(auth)` e `(painel)` são "grupos de rotas": os parênteses organizam as pastas
> sem aparecer no endereço.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` (esse arquivo nunca vai para o Git).

| Variável                        | Uso                                                 |
| ------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV`           | `development`, `staging` ou `production`            |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase — veja docs/SUPABASE.md (pode ficar vazio) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase — veja docs/SUPABASE.md (pode ficar vazio) |
| `ADMIN_LOCALE`                  | Idioma do painel: `pt-BR` (padrão), `en` ou `es`    |
| `ADMIN_AUTH_MODE`               | `disabled` (padrão, sem login) ou `supabase`        |

Sem nenhum `.env.local`, o painel funciona em modo desenvolvimento (sem login).

## Autenticação (preparada, não implementada)

- `getAdminSession()` (`src/lib/auth/session.ts`) decide se há um administrador logado.
- O layout de `(painel)` chama essa função e manda para `/login` quando não há sessão.
- Com `ADMIN_AUTH_MODE=disabled`, uma sessão simulada libera o painel e o menu mostra
  "Modo desenvolvimento — sem login".
- Com `ADMIN_AUTH_MODE=supabase`, ainda não há login real: o painel sempre manda para `/login`.

## Pacotes compartilhados

`@gfg/core`, `@gfg/i18n` e `@gfg/ui` já estão listados em `transpilePackages`
(`next.config.ts`). Quando forem criados (etapa 5), basta adicioná-los como dependência
`"workspace:*"` no `package.json` e importar.

## Comandos

| Comando (dentro de `apps/admin` ou com `--filter @gfg/admin`) | O que faz                    |
| ------------------------------------------------------------- | ---------------------------- |
| `pnpm dev`                                                    | Desenvolvimento (porta 3000) |
| `pnpm build`                                                  | Build de produção            |
| `pnpm start`                                                  | Roda o build de produção     |
| `pnpm typecheck`                                              | Verifica os tipos            |
| `pnpm lint`                                                   | ESLint                       |
