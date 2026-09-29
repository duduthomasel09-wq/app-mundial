# Supabase — como configurar e conectar

Este guia é para **Windows**. Os comandos são digitados no **PowerShell** ou no terminal do
VS Code, dentro da pasta do projeto (`app-mundial`).

Há dois jeitos de usar o Supabase:

| Jeito                         | Para quê                                    | Precisa de                       |
| ----------------------------- | ------------------------------------------- | -------------------------------- |
| **A. Projeto na nuvem (dev)** | Banco real de desenvolvimento, na internet  | Conta grátis no Supabase         |
| **B. Supabase local**         | Testar tudo no seu computador, sem internet | Docker Desktop (programa pesado) |

Para começar, o **jeito A** é o mais simples. O jeito B é opcional.

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
npx supabase db push --include-seed
```

- Mostra a lista de migrations que serão aplicadas e pergunta `[Y/n]` → `Y`.
- `--include-seed` também grava os idiomas, moedas e países iniciais.

Para conferir: no site do Supabase, abra **Table Editor** → devem aparecer as tabelas
`locales` (3 linhas), `currencies` (4) e `countries` (5).

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
> total ao banco. Ela só será usada no servidor, em etapas futuras.
>
> Os arquivos `.env.local` já estão no `.gitignore` — eles não vão para o GitHub.

Nesta etapa os apps ainda **não** usam o Supabase; preencher esses valores é só preparação.

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

---

## 4. Criar uma nova migration (etapas futuras)

```powershell
npx supabase migration new nome_da_mudanca
```

Cria `supabase/migrations/<data-hora>_nome_da_mudanca.sql`. Escreva o SQL, teste com
`npx supabase db reset` (local) e envie com `npx supabase db push` (nuvem).

**Regra:** nunca edite uma migration que já foi enviada — crie outra.

---

## Problemas comuns

| Mensagem                              | Solução                                                              |
| ------------------------------------- | -------------------------------------------------------------------- |
| `Cannot find project ref`             | Rode o `npx supabase link --project-ref ...` (passo 2.2)             |
| `password authentication failed`      | Senha do banco errada. Dá para trocar em Project Settings → Database |
| `Cannot connect to the Docker daemon` | Só no jeito B: abra o Docker Desktop e espere ele iniciar            |
| `npx` não é reconhecido               | Instale o Node.js 22 (veja `docs/DEVELOPMENT.md`)                    |
