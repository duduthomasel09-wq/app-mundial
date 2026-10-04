# apps/admin — Painel administrativo

Painel do **Global Food Guide** (`@gfg/admin`), feito com **Next.js 16 + TypeScript**.
Serve para a equipe gerenciar o conteúdo do app. Já tem **login real** (Supabase Auth, só
`editor`/`admin` — ADR 0016); os cadastros de conteúdo chegam nas próximas etapas da Fase 1.

## Rodar

```bash
# na raiz do monorepo
pnpm install
pnpm --filter @gfg/admin dev
```

Abra http://localhost:3000 → sem `.env.local`, vai direto para o **Dashboard** (modo sem login).
Para usar o login real, veja [Autenticação](#autenticação).

## Rotas

| Rota              | O que é                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| `/`               | Redireciona para `/dashboard`                                                         |
| `/login`          | Login com e-mail e senha (ativo com `ADMIN_AUTH_MODE=supabase`)                       |
| `/dashboard`      | Tela inicial do painel, com menu lateral das áreas futuras ("Em breve")               |
| `/sem-permissao`  | Encerra a sessão de quem perdeu o papel e volta para `/login` (uso interno do painel) |
| `/esqueci-senha`  | Pede o e-mail de recuperação de senha (mesma resposta, exista a conta ou não)         |
| `/auth/confirmar` | Destino do link do e-mail: valida o `token_hash` e vai para `/nova-senha`             |
| `/nova-senha`     | Define a nova senha (só logo depois do link do e-mail)                                |

## Estrutura

```
apps/admin
├── .env.example            Modelo das variáveis de ambiente (sem chaves reais)
├── eslint.config.mjs       ESLint (regras do Next.js + TypeScript)
├── next.config.ts          Configuração do Next.js (pacotes, cabeçalhos das telas de login)
├── package.json
├── tsconfig.json           Estende @gfg/config/typescript/nextjs.json
└── src
    ├── app
    │   ├── layout.tsx          Layout raiz (HTML, título, estilos globais)
    │   ├── globals.css         Estilos base (cores e medidas vêm dos tokens de @gfg/ui)
    │   ├── icon.svg            Ícone da aba do navegador
    │   ├── page.tsx            "/" → redireciona para /dashboard
    │   ├── (auth)/AuthCard.tsx Moldura comum das telas sem login (+ auth.module.css)
    │   ├── (auth)/login/       Tela de login (página + formulário)
    │   ├── (auth)/esqueci-senha/  "Esqueci minha senha"
    │   ├── (auth)/nova-senha/  Definir a nova senha
    │   ├── (auth)/sem-permissao/  Encerra a sessão de quem não tem papel
    │   ├── auth/confirmar/     Recebe o link do e-mail de recuperação
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
        ├── supabase/           Cliente Supabase do servidor + opções dos cookies
        └── auth/               Sessão, papéis, recuperação e ações (entrar, sair, senha)
```

E na raiz de `src`: `proxy.ts` — renova a sessão do Supabase a cada acesso (Next 16).

> `(auth)` e `(painel)` são "grupos de rotas": os parênteses organizam as pastas
> sem aparecer no endereço.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` (esse arquivo nunca vai para o Git).
Todas as variáveis são lidas e validadas em `src/lib/env.ts`; lista completa em
[docs/ENVIRONMENT.md](../../docs/ENVIRONMENT.md).

| Variável                        | Uso                                                                   |
| ------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV`           | `development` (padrão), `staging` ou `production`                     |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase — veja docs/SUPABASE.md (obrigatória com `supabase`)         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave **pública** do Supabase (obrigatória com `supabase`)            |
| `NEXT_PUBLIC_ADMIN_URL`         | Endereço do painel para o link de recuperação (dev: `localhost:3000`) |
| `ADMIN_LOCALE`                  | Idioma do painel: `pt-BR` (padrão), `en` ou `es`                      |
| `ADMIN_AUTH_MODE`               | `disabled` (padrão, sem login; **só development**) ou `supabase`      |

Sem nenhum `.env.local`, o painel funciona em modo desenvolvimento (sem login).
Valores inválidos não quebram o painel: usam o padrão e mostram um aviso no terminal.

## Autenticação

Decisões: [ADR 0016](../../docs/decisions/0016-login-painel.md) (login) e
[ADR 0017](../../docs/decisions/0017-recuperacao-senha-painel.md) (recuperação de senha).

**Modo `supabase` (login real):**

- `/login` tem e-mail e senha e o link **"Esqueci minha senha"**. Não há cadastro no painel.
- Entrar e sair são **Server Actions** (`src/lib/auth/actions.ts`); a sessão fica em cookies
  `HttpOnly` gravados pelo `@supabase/ssr`. Nenhuma chave secreta é usada — só a pública.
- `getAdminAccess()` (`src/lib/auth/session.ts`) confirma o usuário no Supabase e lê os papéis
  em `user_roles` **a cada acesso**. Só entra quem tem `editor` ou `admin` (regra em `@gfg/core`).
- Conta sem papel: a sessão é encerrada e aparece "sem permissão". Se o papel for removido
  durante o uso, o próximo acesso faz o mesmo.
- `src/proxy.ts` só renova a sessão (troca o token vencido); quem decide o acesso é o servidor.
- O menu mostra nome, e-mail, papel e o botão **Sair**.

**Recuperação de senha (ADR 0017):**

1. `/esqueci-senha`: a pessoa informa o e-mail. A resposta é **sempre a mesma**, exista a conta
   ou não.
2. O e-mail traz um link `NEXT_PUBLIC_ADMIN_URL/auth/confirmar?token_hash=…&type=recovery`. Ele
   funciona em qualquer navegador ou aparelho e só pode ser usado uma vez.
3. `/auth/confirmar` valida o link (`verifyOtp`), cria a sessão e vai para `/nova-senha` — sem o
   token na URL. Link inválido, adulterado, vencido ou já usado → `/esqueci-senha` com a mensagem
   e o formulário para pedir outro.
4. `/nova-senha`: nova senha + confirmação (mínimo 8 caracteres, máximo 72 **bytes**). Só abre
   logo depois do link (marca de recuperação em cookie `HttpOnly`, 15 minutos).
5. Depois da troca: as outras sessões da conta são encerradas, esta também, e a pessoa volta para
   `/login` com "senha alterada".

Quem não tem papel `editor`/`admin` pode trocar a senha, mas continua sem acesso ao painel. As
telas do fluxo enviam `Referrer-Policy: no-referrer` e não ficam em cache.

**Modo `disabled` (padrão, sem login):**

- Uma sessão simulada libera o painel e o menu mostra "Modo desenvolvimento — sem login" —
  **só em `development`**. Com `NEXT_PUBLIC_APP_ENV=staging` ou `production` a sessão simulada é
  **recusada**: o painel envia para `/login` e o atalho sem login some (ADR 0013/0017).
- Fora de produção, o menu e o login mostram o selo **"Desenvolvimento"**.

Como ligar o login no projeto de desenvolvimento: [docs/SUPABASE.md](../../docs/SUPABASE.md),
seção 5.3. Recuperação de senha no projeto de desenvolvimento: seção 5.4.

## Pacotes compartilhados

`@gfg/core`, `@gfg/i18n` e `@gfg/ui` estão em `transpilePackages` (`next.config.ts`) e como
dependência `"workspace:*"` no `package.json`.

## Comandos

| Comando (dentro de `apps/admin` ou com `--filter @gfg/admin`) | O que faz                    |
| ------------------------------------------------------------- | ---------------------------- |
| `pnpm dev`                                                    | Desenvolvimento (porta 3000) |
| `pnpm build`                                                  | Build de produção            |
| `pnpm start`                                                  | Roda o build de produção     |
| `pnpm typecheck`                                              | Verifica os tipos            |
| `pnpm lint`                                                   | ESLint                       |
