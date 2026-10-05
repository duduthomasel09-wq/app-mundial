# Supabase — como configurar e conectar

Este guia é para **Windows**. Os comandos são digitados no **PowerShell** ou no terminal do
VS Code, dentro da pasta do projeto (`app-mundial`).

> Este guia cobre o projeto de **desenvolvimento**. Produção (ainda não criada), checklist de
> promoção e regras de separação: [AMBIENTES.md](AMBIENTES.md).
>
> **Caminho oficial para aplicar migrations no desenvolvimento:** o workflow do GitHub
> **Supabase dev — migrations** ([CI.md](CI.md#migrations-no-desenvolvimento-supabase-dev--migrations),
> ADR 0014). Os comandos do CLI abaixo continuam valendo como alternativa no seu computador.

Há dois jeitos de usar o Supabase:

| Jeito                         | Para quê                                    | Precisa de                       |
| ----------------------------- | ------------------------------------------- | -------------------------------- |
| **A. Projeto na nuvem (dev)** | Banco real de desenvolvimento, na internet  | Conta grátis no Supabase         |
| **B. Supabase local**         | Testar tudo no seu computador, sem internet | Docker Desktop (programa pesado) |

Para começar, o **jeito A** é o mais simples. O jeito B é opcional.

> **Não tem o VS Code, o Node.js ou o Git instalados?** Dá para criar as tabelas só pelo
> navegador: veja a seção [2.3-B](#23-b-sem-instalar-nada--pelo-sql-editor-do-site).

## Situação atual do projeto de desenvolvimento

| Item                                            | Situação                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projeto `global-food-guide-dev` criado          | ✅ 29/09/2026                                                                                                                                                                                                                                                           |
| Migration `20260929120000_fundacao.sql`         | ✅ Aplicada pelo SQL Editor do site (seção 2.3-B)                                                                                                                                                                                                                       |
| Dados de referência (idiomas, moedas, países)   | ✅ No banco e registrados na migration `20260929130000_dados_referencia.sql`                                                                                                                                                                                            |
| Registro das migrations no histórico            | ✅ 30/09/2026: `repair` da `20260929120000` + `db push` da `20260929130000`, pelo GitHub Actions. Hoje as migrations do dev são aplicadas pelo workflow **Supabase dev — migrations** ([CI.md](CI.md#migrations-no-desenvolvimento-supabase-dev--migrations), ADR 0014) |
| Usuários, papéis e auditoria (`20260930120000`) | ✅ Aplicada em 01/10/2026 pelo workflow (`verificar` → `aplicar`)                                                                                                                                                                                                       |
| Confirmação de e-mail e primeiro admin          | ✅ Confirmação de e-mail ligada; primeiro admin criado — seção 5                                                                                                                                                                                                        |
| Chaves públicas nos apps (`.env.local`)         | ⏳ Painel: preencher para usar o login real (seção 5.3). App: ainda não usa                                                                                                                                                                                             |
| Recuperação de senha do painel                  | ⏳ Configurar URL permitida e modelo do e-mail no site do Supabase — seção 5.4                                                                                                                                                                                          |
| Login e cadastro do app (código de 6 dígitos)   | ⏳ Configurar o modelo "Confirm signup" e conferir o tamanho do código — seção 5.5                                                                                                                                                                                      |

---

## 1. Instalar o Supabase CLI

O CLI é o programa que envia as migrations para o banco. Não é preciso instalar nada:
o Node.js (que você já tem) baixa o CLI na hora com `npx`.

```powershell
npx supabase --version
```

Na primeira vez ele pergunta `Ok to proceed? (y)` — digite `y` e Enter. Deve aparecer um número de versão (ex.: `2.x.x`).

> Em todos os comandos abaixo, use `npx supabase ...`.

---

## 2. Jeito A — conectar a um projeto de desenvolvimento na nuvem

### 2.1 Criar o projeto (uma vez só)

1. Entre em https://supabase.com e crie uma conta (pode ser com o GitHub).
2. Clique em **New project**.
   - **Name:** `global-food-guide-dev`
   - **Database Password:** clique em **Generate a password** e **guarde a senha** num
     gerenciador de senhas. Ela **nunca** vai para o Git nem para arquivos do projeto.
   - **Region:** a mais próxima de você (ex.: _South America (São Paulo)_).
3. Espere o projeto ficar pronto (1–2 minutos).
4. Anote o **Project ID** (também chamado de _Reference ID_): está em
   **Project Settings → General**. É um código como `abcdefghijklmnopqrst`.

### 2.2 Ligar o projeto do computador ao projeto da nuvem

```powershell
npx supabase login
```

Abre o navegador para você autorizar. Depois:

```powershell
npx supabase link --project-ref SEU_PROJECT_ID
```

Ele pede a senha do banco (a do passo 2.1). Pronto: o computador sabe qual projeto usar.
Isso fica salvo em `supabase/.temp/`, que **não** vai para o Git.

### 2.3 Criar as tabelas e os dados iniciais na nuvem

```powershell
npx supabase db push
```

- Mostra a lista de migrations que serão aplicadas e pergunta `[Y/n]` → `Y`.
- Os idiomas, moedas e países iniciais vêm na migration `20260929130000_dados_referencia.sql`.
- `--include-seed` (dados fictícios de `supabase/seed/`) só no **desenvolvimento** —
  **proibido em produção** (ADR 0013).

Para conferir: no site do Supabase, abra **Table Editor** → devem aparecer as tabelas
`locales` (3 linhas), `currencies` (4) e `countries` (5).

### 2.3-B Sem instalar nada — pelo SQL Editor do site

Alternativa ao passo 2.3 para quem ainda não tem o VS Code, o Node.js e o Git no computador.
Faz o mesmo resultado, só que colando o SQL no navegador. **Só no projeto de desenvolvimento —
nunca use o SQL Editor em produção.**

1. Abra o arquivo da migration no GitHub:
   https://github.com/duduthomasel09-wq/app-mundial/blob/main/supabase/migrations/20260929120000_fundacao.sql
2. Clique em **Copy raw file** (ícone 📋, no canto de cima à direita do arquivo).
3. No site do Supabase, abra o projeto → **SQL Editor** (ícone `>_` na barra da esquerda).
4. Cole (**Ctrl+V**) e clique em **Run** (ou **Ctrl+Enter**).
   Deve aparecer **"Success. No rows returned"**.
5. Repita com a migration de dados de referência, numa aba nova (**+**):
   https://github.com/duduthomasel09-wq/app-mundial/blob/main/supabase/migrations/20260929130000_dados_referencia.sql
   (Até a etapa 10 este passo usava o arquivo do seed; o conteúdo é o mesmo.)
6. Confira em **Table Editor**: `countries` (5 linhas), `currencies` (4) e `locales` (3).

> ⚠️ **Importante para depois:** quando o SQL é colado no site, o Supabase **não registra**
> que a migration foi aplicada. Por isso, **na primeira vez** que usar o CLI (depois de fazer o
> `login` e o `link` do passo 2.2), rode **antes de qualquer `db push`**:
>
> ```powershell
> npx supabase migration repair --status applied 20260929120000
> ```
>
> (Se você colou também a migration de dados de referência no SQL Editor, marque-a da mesma
> forma: `... --status applied 20260929130000`. Se não, deixe o `db push` aplicá-la.)
>
> Isso só anota "esta migration já foi aplicada" — não muda nenhuma tabela nem dado.
> Confira com `npx supabase migration list`: o número deve aparecer nas colunas **Local** e **Remote**.
>
> Cada nova migration aplicada pelo SQL Editor precisa do mesmo `repair` com o seu próprio número.
> Por isso, depois de instalar o CLI, prefira sempre o `db push` (passo 2.3).

### 2.4 Publicar a Edge Function de teste (opcional)

```powershell
npx supabase functions deploy health
```

Teste abrindo no navegador: `https://SEU_PROJECT_ID.supabase.co/functions/v1/health`
→ deve mostrar `{"status":"ok", ...}`.

### 2.5 Colocar a URL e a chave pública nos apps

No site do Supabase, abra **Project Settings → API Keys** (e **Data API** para a URL).

| Onde copiar                     | Para onde                                                         |
| ------------------------------- | ----------------------------------------------------------------- |
| Project URL                     | `NEXT_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_URL`           |
| Publishable key (ou _anon_ key) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` |

1. Copie `apps/admin/.env.example` para `apps/admin/.env.local` e preencha.
2. Copie `apps/mobile/.env.example` para `apps/mobile/.env.local` e preencha.

> ⚠️ **Nunca** copie a chave **secret** / **service_role** para esses arquivos: ela dá acesso
> total ao banco. O painel e o app usam **só** a chave pública.
>
> Os arquivos `.env.local` já estão no `.gitignore` — eles não vão para o GitHub.

O **painel** usa esses valores quando o login real está ligado (seção 5.3). O **app** ainda não
usa o Supabase; no app, preencher é só preparação.

---

## 3. Jeito B — Supabase local (opcional)

1. Instale o **Docker Desktop** (https://www.docker.com/products/docker-desktop) e abra-o.
2. Na pasta do projeto:

```powershell
npx supabase start
```

A primeira vez demora (baixa vários programas). No fim aparecem as URLs e chaves **locais**
(de teste, não são segredos). O painel do banco abre em http://127.0.0.1:54323.

| Comando                        | O que faz                                        |
| ------------------------------ | ------------------------------------------------ |
| `npx supabase start`           | Liga o Supabase local                            |
| `npx supabase stop`            | Desliga                                          |
| `npx supabase db reset`        | Apaga o banco local e recria (migrations + seed) |
| `npx supabase functions serve` | Roda as Edge Functions localmente                |
| `npx supabase status`          | Mostra URLs e chaves locais                      |

E-mails do Supabase local (ex.: recuperação de senha do painel) **não são enviados de verdade**:
ficam na caixa de testes **Mailpit**, em http://127.0.0.1:54324. Os modelos ficam em
`supabase/templates/`: recuperação de senha do painel (`recovery.html`, ADR 0017) e código de
confirmação do app (`confirmation.html`, ADR 0018 — usado só se a confirmação de e-mail for
ligada no `config.toml`).

---

## 4. Criar uma nova migration (etapas futuras)

```powershell
npx supabase migration new nome_da_mudanca
```

Cria `supabase/migrations/<data-hora>_nome_da_mudanca.sql`. Escreva o SQL, teste com
`npx supabase db reset` (local) e envie com `npx supabase db push` (nuvem).

**Regra:** nunca edite uma migration que já foi enviada — crie outra.

---

## 5. Autenticação no projeto de desenvolvimento (ADR 0015)

Estas configurações ficam **no site do Supabase**, não no código. O `supabase/config.toml` vale
só para o ambiente local (onde a confirmação de e-mail fica desligada).

### 5.1 Confirmação de e-mail (ligada)

1. Site do Supabase → projeto de desenvolvimento → **Authentication** → **Sign In / Providers**
   → **Email**.
2. Deixe **Enable Email provider** e **Confirm email** **ligados** e salve.
3. Recomendado: tamanho mínimo de senha = **8** (igual ao ambiente local). O nome e o lugar
   dessa opção mudam conforme a versão do site (ex.: **Minimum password length**, nas opções do
   Email ou numa área de segurança de senha). Se não aparecer, deixe como está — o painel não
   tem cadastro; isso volta a importar no cadastro pelo app (etapa futura). A tela de nova
   senha do painel já exige 8 caracteres por conta própria (ADR 0017).

### 5.2 Criar o primeiro admin (só depois da migration `20260930120000` aplicada)

Ninguém consegue se dar papéis pelo app ou pelo painel — nem o primeiro usuário. Por isso o
**primeiro admin** é criado uma única vez, pelo dono do projeto, no **SQL Editor do projeto de
desenvolvimento** (permitido no dev; **nunca** em produção — ADR 0013).

1. Crie a sua conta e confirme o e-mail. O painel não tem cadastro; enquanto o app não tem
   (etapa futura), use **Authentication** → **Users** → **Add user**.
2. No **SQL Editor**, troque o e-mail e rode:

   ```sql
   -- Confere se a conta existe (deve aparecer 1 linha):
   select id, email from auth.users where email = 'seu-email@exemplo.com';

   -- Concede o papel admin a essa conta (pode rodar de novo sem duplicar):
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'seu-email@exemplo.com'
   on conflict do nothing;

   -- Confere:
   select u.email, r.role from public.user_roles r join auth.users u on u.id = r.user_id;
   ```

3. Os próximos papéis (`editor`/`admin`) serão dados **pelo painel**, por um admin, e ficam
   registrados no `audit_log`.

> O sistema nunca fica sem admin ativo: o papel do último admin não pode ser revogado, e a
> conta dele não pode ser excluída (nem "suavemente") — conceda `admin` a outra pessoa antes.

### 5.3 Ligar o login do painel (ADR 0016)

O painel só deixa entrar contas com papel `editor` ou `admin` (seção 5.2). Para usar o login
real no computador:

1. Copie `apps/admin/.env.example` para `apps/admin/.env.local` (não vai para o Git).
2. Preencha com os valores do projeto de **desenvolvimento** (seção 2.5) — só a chave pública:

   ```bash
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_SUPABASE_URL=https://<id-do-projeto-dev>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
   NEXT_PUBLIC_ADMIN_URL=http://localhost:3000
   ADMIN_AUTH_MODE=supabase
   ```

3. Rode `pnpm --filter @gfg/admin dev` e abra http://localhost:3000 → vai para `/login`.
4. Entre com o e-mail e a senha da conta admin.

O que esperar:

| Situação                              | Resultado                                                |
| ------------------------------------- | -------------------------------------------------------- |
| Senha errada ou e-mail que não existe | "E-mail ou senha incorretos." (mesma mensagem nos dois)  |
| E-mail ainda não confirmado           | Pede para confirmar o e-mail                             |
| Conta sem papel                       | "Sua conta não tem permissão…" e a sessão é encerrada    |
| Conta `editor` ou `admin`             | Entra no Dashboard; o menu mostra nome, papel e **Sair** |
| **Sair**                              | Volta para `/login`; o Dashboard volta a pedir login     |

Para voltar ao modo sem login, troque para `ADMIN_AUTH_MODE=disabled` (ou apague a linha).

### 5.4 Recuperação de senha do painel (ADR 0017) — ⏳ configuração manual pendente

O painel já tem "Esqueci minha senha" (`/esqueci-senha` → e-mail → `/auth/confirmar` →
`/nova-senha`). Para funcionar com o projeto de **desenvolvimento**, o dono do projeto precisa
fazer **duas configurações no site do Supabase** (nada disso é feito pelo código nem pelo
GitHub). Faça só depois de revisar e aprovar a etapa 1.3.

**1. Endereço permitido para o link do e-mail**

Site do Supabase → projeto de desenvolvimento → **Authentication** → **URL Configuration** →
**Redirect URLs** → **Add URL**:

```
http://localhost:3000/auth/confirmar
```

Não mude o **Site URL**. Quando o painel tiver endereço público (Vercel), adicione também
`https://<endereço-do-painel>/auth/confirmar` e use esse endereço em `NEXT_PUBLIC_ADMIN_URL`.

**2. Modelo do e-mail "Reset password"**

Site do Supabase → **Authentication** → **Emails** (ou **Email Templates**) → **Reset password**
(ou **Reset Password**). Troque o conteúdo pelo texto abaixo (é o mesmo de
`supabase/templates/recovery.html`) e salve:

```html
<h2>Redefinir sua senha</h2>

<p>Recebemos um pedido para criar uma nova senha para a sua conta do Global Food Guide.</p>

<p>
  <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Criar uma nova senha</a>
</p>

<p>
  O link vale por pouco tempo e só pode ser usado uma vez. Se você não pediu isso, ignore este
  e-mail: sua senha continua a mesma.
</p>
```

Assunto sugerido: `Redefinir sua senha — Global Food Guide`.

> ⚠️ Sem essa troca, o e-mail do dev continua com o link padrão do Supabase, que **não**
> funciona com o painel (o painel espera `token_hash`). Esse modelo é usado só pela recuperação
> de senha; não afeta o login.

**3. Testar** (no computador, com o login real ligado — seção 5.3, incluindo
`NEXT_PUBLIC_ADMIN_URL=http://localhost:3000`):

1. Em `/login`, clique em **Esqueci minha senha** e informe o **seu** e-mail.
2. Abra o e-mail e clique em **Criar uma nova senha** (pode ser em outro navegador ou no celular,
   desde que o painel esteja rodando no computador).
3. Defina a nova senha (mínimo 8 caracteres) e entre com ela.

| Situação                               | Resultado                                                     |
| -------------------------------------- | ------------------------------------------------------------- |
| E-mail que existe ou não existe        | Mesma mensagem ("Se existir uma conta…")                      |
| Link vencido, já usado ou alterado     | "Este link… é inválido ou já venceu" + pedir outro            |
| Senha curta, longa demais ou diferente | Mensagem no formulário                                        |
| Senha igual à atual                    | "A nova senha precisa ser diferente da atual"                 |
| Depois de salvar                       | Volta para `/login` com "Senha alterada"; outras sessões saem |
| Conta sem papel `editor`/`admin`       | Troca a senha, mas continua sem acesso ao painel              |

> **Limites do e-mail embutido do Supabase:** poucos envios por hora e, pelas regras atuais,
> possivelmente só para e-mails de membros da equipe do projeto. Teste com o **seu** e-mail. Se
> pedir vários links seguidos, o Supabase pode ignorar os pedidos repetidos (o painel mostra a
> mesma mensagem, de propósito). Antes do beta: SMTP próprio (decisão futura).

### 5.5 Login, cadastro e onboarding do app (ADR 0018) — ⏳ configuração manual pendente

O app confirma o cadastro com um **código de 6 dígitos** digitado no próprio app (sem links que
abrem o app). Para funcionar com o projeto de **desenvolvimento**, o dono do projeto precisa
fazer no site do Supabase (nada disso é feito pelo código nem pelo GitHub). Faça só depois de
revisar e aprovar a etapa 1.4.

**1. Tamanho do código = 6**

Site do Supabase → projeto de desenvolvimento → **Authentication** → **Sign In / Providers** →
**Email**: confira se **Email OTP Length** está em **6** (o app aceita exatamente 6 dígitos).
O nome e o lugar podem mudar conforme a versão do site. **Email OTP Expiration** pode ficar no
padrão.

**2. Modelo do e-mail "Confirm signup"**

**Authentication** → **Emails** (ou **Email Templates**) → **Confirm signup**. Troque o conteúdo
pelo texto abaixo (é o mesmo de `supabase/templates/confirmation.html`) e salve:

```html
<h2>Confirme seu e-mail</h2>

<p>Use este código no app Global Food Guide para confirmar sua conta:</p>

<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px">{{ .Token }}</p>

<p>O código vale por pouco tempo. Se você não criou uma conta, ignore este e-mail.</p>
```

Assunto sugerido: `Seu código de confirmação — Global Food Guide`.

> ⚠️ Sem essa troca, o e-mail do dev continua com o **link** padrão do Supabase, e o app não tem
> onde digitar nada útil — o cadastro fica sem confirmar. Esse modelo só afeta o cadastro.

**3. Testar no celular (Expo Go)**

1. Crie `apps/mobile/.env.local` a partir de `apps/mobile/.env.example`, com a URL e a chave
   **pública** do projeto de desenvolvimento (seção 2.5) — nunca a secreta.
2. `pnpm --filter @gfg/mobile dev` e escaneie o QR code com o Expo Go.
3. Faça o onboarding, crie conta com o **seu** e-mail, digite o código, feche e abra o app (deve
   continuar com a conta), saia e entre de novo.

| Situação                                  | Resultado                                               |
| ----------------------------------------- | ------------------------------------------------------- |
| Primeiro acesso                           | Onboarding (idioma, país, moeda e unidades) — sem conta |
| Criar conta (e-mail novo **ou** já usado) | Tela do código (mesma resposta nos dois casos)          |
| Código errado ou vencido                  | "Código inválido ou vencido"                            |
| "Reenviar código"                         | Liberado depois de 60 s                                 |
| Senha errada ou e-mail que não existe     | "E-mail ou senha incorretos" (mesma mensagem)           |
| Entrar com e-mail não confirmado          | Volta para a tela do código (com código novo)           |
| Conta com perfil incompleto               | Onboarding antes do início                              |
| Fechar e abrir o app                      | Continua com a conta                                    |

> **Limites do e-mail embutido do Supabase:** poucos envios por hora e, possivelmente, só para
> e-mails de membros da equipe do projeto. Teste com o **seu** e-mail.

## Problemas comuns

| Mensagem                                         | Solução                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `relation "locales" already exists` no `db push` | A migration já foi aplicada pelo site: rode o `migration repair` da seção 2.3-B |
| `Cannot find project ref`                        | Rode o `npx supabase link --project-ref ...` (passo 2.2)                        |
| `password authentication failed`                 | Senha do banco errada. Dá para trocar em Project Settings → Database            |
| `Cannot connect to the Docker daemon`            | Só no jeito B: abra o Docker Desktop e espere ele iniciar                       |
| `npx` não é reconhecido                          | Instale o Node.js 22 (veja `docs/DEVELOPMENT.md`)                               |
