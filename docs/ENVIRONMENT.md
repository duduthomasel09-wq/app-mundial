# Variáveis de ambiente

Lista única de todas as variáveis do projeto (ADR 0011). Nenhum valor real fica no Git:
os arquivos `.env.example` são só modelos, com campos vazios ou valores padrão.

## Ambientes

| Ambiente      | Situação (ADR 0013)                                   | Onde ficam os valores                                                  |
| ------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `development` | **Ativo** — seu computador (padrão)                   | `.env.local` de cada app (fora do Git), apontando para o **dev**       |
| `production`  | **Ativo** — usuários reais (projeto ainda não criado) | Só na hospedagem / serviço de build / GitHub — **nunca** no computador |
| `staging`     | Aceito no código, **sem projeto** nesta fase          | —                                                                      |

Os testes automáticos rodam como `development`. Separação dev/prod, checklist e regras:
[AMBIENTES.md](AMBIENTES.md).

## Todas as variáveis

**Tipo:** 🌐 pública (vai para o app/navegador — qualquer pessoa pode ver) ·
🖥️ só do servidor (não é segredo) · 🔒 **secreta** (nunca em app, `.env.example` ou Git).

### Painel — `apps/admin` (modelo: `apps/admin/.env.example`)

| Variável                        | Tipo | Valores                                  | Padrão                    | Em production |
| ------------------------------- | ---- | ---------------------------------------- | ------------------------- | ------------- |
| `NEXT_PUBLIC_APP_ENV`           | 🌐   | `development` · `staging` · `production` | `development`             | `production`  |
| `NEXT_PUBLIC_SUPABASE_URL`      | 🌐   | `https://<id>.supabase.co`               | vazio                     | necessária ¹  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 🌐   | chave **publishable** (ou _anon_)        | vazio                     | necessária ¹  |
| `NEXT_PUBLIC_ADMIN_URL`         | 🌐   | `https://painel.exemplo.com` (só origem) | `http://localhost:3000` ³ | necessária ³  |
| `ADMIN_LOCALE`                  | 🖥️   | `pt-BR` · `en` · `es`                    | `pt-BR`                   | opcional      |
| `ADMIN_AUTH_MODE`               | 🖥️   | `disabled` · `supabase`                  | `disabled`                | `supabase` ²  |

### App — `apps/mobile` (modelo: `apps/mobile/.env.example`)

| Variável                        | Tipo | Valores                                  | Padrão        | Em production |
| ------------------------------- | ---- | ---------------------------------------- | ------------- | ------------- |
| `EXPO_PUBLIC_APP_ENV`           | 🌐   | `development` · `staging` · `production` | `development` | `production`  |
| `EXPO_PUBLIC_SUPABASE_URL`      | 🌐   | `https://<id>.supabase.co`               | vazio         | necessária ¹  |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | 🌐   | chave **publishable** (ou _anon_)        | vazio         | necessária ¹  |

### Supabase CLI (modelo de referência: `supabase/.env.example`)

| Variável                | Tipo | Para quê                                                     |
| ----------------------- | ---- | ------------------------------------------------------------ |
| `SUPABASE_DB_PASSWORD`  | 🔒   | Senha do banco (`link`, `db push`). Opcional: o CLI pergunta |
| `SUPABASE_ACCESS_TOKEN` | 🔒   | Login do CLI sem navegador (automação — etapa 10)            |

### GitHub Actions — Environment `development` (ADR 0014)

Configurado no site do GitHub (Settings → Environments → `development`), **nunca** em arquivo.
Usado só pelo workflow **Supabase dev — migrations**.

| Nome                    | Tipo                     | Para quê                            |
| ----------------------- | ------------------------ | ----------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | 🔒 secret do Environment | CLI no GitHub (link, dry-run, push) |
| `SUPABASE_PROJECT_REF`  | variável do Environment  | ID do projeto de desenvolvimento    |

### Edge Functions (modelo: `supabase/functions/.env.example`)

| Variável                    | Tipo | Observação                                                |
| --------------------------- | ---- | --------------------------------------------------------- |
| `SUPABASE_URL`              | —    | Fornecida automaticamente pelo Supabase                   |
| `SUPABASE_ANON_KEY`         | —    | Fornecida automaticamente pelo Supabase                   |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔒   | Fornecida automaticamente — **só** dentro das funções     |
| `REVENUECAT_WEBHOOK_SECRET` | 🔒   | Futuro (Fase 2). Cadastrar com `npx supabase secrets set` |

¹ Vazia é permitida; em `production` gera aviso. No painel, com `ADMIN_AUTH_MODE=supabase` as duas
são **obrigatórias** (sem elas ninguém entra e aparece **erro**). No app, sem as duas ele funciona
**sem conta** (onboarding e preferências no aparelho) e esconde entrar/criar conta (ADR 0018).
² `supabase` = login real (ADR 0016). Fora de `development` (em `staging` **e** `production`),
`disabled` é **bloqueado** (ADR 0013/0017): a sessão sem login é recusada e o painel envia para
`/login` (o build não é impedido).
³ Endereço do painel para o link do e-mail de recuperação de senha (ADR 0017). Nunca é montado a
partir do endereço da requisição. Vazia só em `development` (usa `http://localhost:3000`); em
`staging`/`production` precisa ser `https://` e não local — senão a recuperação de senha fica
desligada e aparece **erro**.

## Como os valores são lidos e validados

- **Painel:** `apps/admin/src/lib/env.ts` · **App:** `apps/mobile/src/lib/env.ts`.
  Ninguém mais lê `process.env` diretamente.
- As regras ficam em `@gfg/core` (`packages/core/src/env.ts`), sem biblioteca extra:
  - valor ausente → usa o padrão, sem aviso;
  - valor inválido (ex.: `ADMIN_AUTH_MODE=supabse`) → usa o padrão e mostra **aviso**;
  - URL que não começa com `http(s)://` → ignorada, com aviso;
  - **chave secreta** do Supabase numa variável pública → descartada, com **erro** no console;
  - variáveis do Supabase vazias em `production` → aviso;
  - URL `localhost`/`127.0.0.1` em `production` → **erro**, URL descartada (ADR 0013);
  - `ADMIN_AUTH_MODE=disabled` em `staging` ou `production` → **erro** e sessão sem login bloqueada;
  - `NEXT_PUBLIC_ADMIN_URL` vazia/local/`http://` fora de `development` (com login real) → **erro** e
    recuperação de senha desligada;
  - `ADMIN_AUTH_MODE=supabase` sem URL ou chave pública → **erro** e ninguém entra no painel.
- Fora de `production`, o painel e o app mostram o selo **"Desenvolvimento"**.
- Os avisos aparecem no terminal (`pnpm dev` / build) e mostram **só o nome** da variável,
  nunca o valor.
- Escreva sempre `process.env.NOME_COMPLETO` por extenso: o Next.js e o Expo só copiam para o
  build as variáveis públicas escritas assim.

> ⚠️ A verificação de chave secreta é um **alarme**, não uma proteção completa: o Next.js e o
> Expo copiam as variáveis públicas para dentro do build antes de o código rodar. Se uma chave
> secreta for colocada numa variável pública por engano, **troque a chave no Supabase**.

## Passo a passo (desenvolvimento, Windows)

1. Na pasta `apps/admin`, copie `.env.example` e renomeie a cópia para `.env.local`.
2. Faça o mesmo em `apps/mobile`.
3. Preencha só o que precisar (tudo é opcional em desenvolvimento).
4. Reinicie o `pnpm dev` depois de mudar um `.env.local`.

## Regras de segurança

- `.env`, `.env.local`, `.env.production` etc. **nunca** vão para o Git (`.gitignore` já bloqueia).
  Só arquivos `*.env.example` são versionados, e sempre sem valores reais.
- Chaves 🔒 nunca em variáveis `EXPO_PUBLIC_*` ou `NEXT_PUBLIC_*`.
- **Valores de produção nunca em `.env.local`**: o seu computador aponta só para o desenvolvimento.
- Se um segredo vazar (Git, print, mensagem): **troque-o imediatamente** no serviço de origem.
