# CI — verificação automática (GitHub Actions)

A CI verifica o projeto automaticamente a cada mudança (ADR 0012). Ela **só verifica**:
não publica o app, não faz deploy e não usa nenhuma chave ou senha.

Arquivo: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Quando roda

| Evento                     | Quando                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `push` na `main`           | Depois de cada envio para a `main` (nosso fluxo atual)        |
| `pull_request` para `main` | Em cada pull request e a cada novo envio nele                 |
| `workflow_dispatch`        | Manualmente: GitHub → **Actions** → **CI** → **Run workflow** |

## O que verifica

A CI tem **três jobs**, que rodam ao mesmo tempo:

**1. Verificações (format, tipos, lint, testes, build)**

| Passo                 | Comando                          | Falha quando…                                        |
| --------------------- | -------------------------------- | ---------------------------------------------------- |
| Instalar dependências | `pnpm install --frozen-lockfile` | o `pnpm-lock.yaml` não bate com os `package.json`    |
| Formatação            | `pnpm format:check`              | algum arquivo não está no padrão do Prettier         |
| Tipos                 | `pnpm typecheck`                 | erro de TypeScript (inclui chave de tradução errada) |
| Lint                  | `pnpm lint`                      | regra do ESLint violada                              |
| Testes                | `pnpm test`                      | algum teste do Vitest falha                          |
| Build                 | `pnpm build`                     | o painel (Next.js) não compila                       |

**2. Empacotamento do app (expo export)**

Gera o pacote JavaScript do app para **Android e iOS** (`expo export`) só para confirmar que o
app empacota. O resultado é descartado. **Não** usa EAS, não publica e não precisa de conta Expo.

**3. Banco de dados (migrations + testes pgTAP)** — ADR 0015

| Passo                      | Comando                                            | Falha quando…                          |
| -------------------------- | -------------------------------------------------- | -------------------------------------- |
| Subir Supabase local       | `supabase start -x …` (Docker)                     | alguma migration ou o seed dá erro     |
| Verificar funções do banco | `supabase db lint --level warning --fail-on error` | erro no código de uma função do banco  |
| Testes de RLS e segurança  | `supabase test db`                                 | algum teste de `supabase/tests/` falha |
| Desligar                   | `supabase stop --no-backup`                        | —                                      |

É um Supabase **local e temporário**, criado e apagado dentro do servidor do GitHub: **sem
secrets** e **sem acesso** a nenhum projeto remoto (nem o de desenvolvimento). CLI fixo em 2.118.0.

Ambiente usado: Node pelo `.nvmrc` (22) e pnpm pelo `packageManager` (10.28.0), com cache da
pasta de pacotes do pnpm. Nenhuma variável de ambiente é necessária (valores padrão da ADR 0011).

## Como ver o resultado

1. No GitHub, abra o repositório → aba **Actions**.
2. Cada execução mostra ✅ (passou) ou ❌ (falhou). Na lista de commits, aparece o mesmo símbolo.
3. Clique numa execução ❌ → no job vermelho → no passo vermelho, para ver a mensagem de erro.

Para reproduzir no seu computador, rode os mesmos comandos na raiz do projeto:

```powershell
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Segurança

- **Permissão mínima:** o workflow só tem permissão de **leitura** do código (`contents: read`).
- **Nenhum secret** é usado. O `checkout` não guarda a credencial do Git (`persist-credentials: false`).
- Usa `pull_request` (e não `pull_request_target`): código de pull requests de fora **não** tem
  acesso a secrets do repositório.
- **Actions fixadas pelo SHA do commit**, com a versão em comentário, contra alterações
  maliciosas numa action:

  | Action               | Versão | SHA                                        |
  | -------------------- | ------ | ------------------------------------------ |
  | `actions/checkout`   | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
  | `pnpm/action-setup`  | v6.1.0 | `ea17c68df8912ef543352723c149a84f56e3d413` |
  | `actions/setup-node` | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` |

  Para atualizar: pegue o SHA da nova versão na página de _releases_ da action e troque o SHA
  **e** o comentário juntos.

- A CI **nunca** altera a `main` (não faz commit, push nem merge).

## Fora da CI (etapas futuras)

- Deploy (Vercel), builds de loja (EAS) e Supabase de produção.
- `expo-doctor` (precisa consultar a internet do Expo).

## Migrations no desenvolvimento ("Supabase dev — migrations")

Workflow **separado da CI**, só manual, para aplicar migrations no projeto Supabase de
**desenvolvimento** (ADR 0014). Arquivo:
[`.github/workflows/supabase-dev-migrations.yml`](../.github/workflows/supabase-dev-migrations.yml).

**Como usar:** GitHub → **Actions** → **Supabase dev — migrations** → **Run workflow** →
escolha o modo:

| Modo                     | O que faz                                                                   | Muda o banco? |
| ------------------------ | --------------------------------------------------------------------------- | ------------- |
| `verificar` (padrão)     | `migration list` + `db push --dry-run` (mostra o que seria aplicado)        | **Não**       |
| `aplicar` (só da `main`) | `migration list` + `db push --dry-run` + `db push --yes` + `migration list` | Sim           |

Rotina recomendada: rode **`verificar`**, leia o passo "Dry-run" (quais migrations entrariam) e,
se estiver certo, rode **`aplicar`**.

**Configuração (feita no GitHub, não no código)** — Settings → **Environments** → `development`:

| Tipo                 | Nome                    | Conteúdo                                              |
| -------------------- | ----------------------- | ----------------------------------------------------- |
| Environment secret   | `SUPABASE_ACCESS_TOKEN` | Token do Supabase (com permissão de escrita no banco) |
| Environment variable | `SUPABASE_PROJECT_REF`  | ID do projeto de desenvolvimento (20 letras)          |
| Deployment branches  | `main`                  | Só a `main` pode usar este Environment                |

Segurança: permissão só de leitura do código; actions fixadas por SHA (`actions/checkout` v7.0.1,
`supabase/setup-cli` v3.0.1 `45a513f8c64c0bc8e0e3dfe572b5c95be85f6359`); Supabase CLI fixo em
**2.118.0**; nunca duas execuções ao mesmo tempo; **nunca** `--include-seed` nem `--include-all`.
Se o secret ou a variável faltarem, o workflow para no primeiro passo com uma mensagem clara.

**Não existe workflow de produção.**

## Futuro: promoção para produção (NÃO configurado)

Nesta fase, levar migrations e Edge Functions para produção é **manual**, com o checklist de
[AMBIENTES.md](AMBIENTES.md). Quando o projeto de produção existir, o plano é:

1. GitHub → **Settings** → **Environments** → criar `development` e `production`.
2. Em `production`: **Required reviewers** (você aprova cada execução) e
   **Deployment branches** = só `main`.
3. Em cada environment, cadastrar:
   - **Secrets:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` (a do projeto daquele ambiente);
   - **Variables:** `SUPABASE_PROJECT_REF` (ID do projeto daquele ambiente).
4. Um workflow **manual** (`workflow_dispatch`) separado da CI: `db push --dry-run` → aprovação
   → `db push` (**nunca** com `--include-seed` em produção) → `functions deploy`.
5. A CI de verificação (`ci.yml`) continua **sem** secrets e sem acesso a nenhum projeto.
6. O token de produção deve ser **diferente** do usado no Environment `development`.

Também planejado: um job da CI que aplica as migrations num PostgreSQL temporário (Fase 1).

## Futuro: exigir CI verde antes de aceitar mudanças (NÃO ativado)

Hoje as mudanças vão **direto para a `main`**; a CI roda **depois** e avisa se algo quebrou.
Para a CI **impedir** mudanças quebradas, é preciso trabalhar com pull requests e ativar a
proteção da branch. **Só faça isso quando decidirmos mudar o fluxo.**

1. GitHub → repositório → **Settings** → **Rules** → **Rulesets** → **New ruleset** →
   **New branch ruleset**.
2. **Ruleset name:** `main`. **Enforcement status:** _Active_.
3. **Target branches** → **Add target** → **Include default branch**.
4. Marque **Require a pull request before merging**.
5. Marque **Require status checks to pass** → **Add checks** → adicione os dois jobs:
   `Verificações (format, tipos, lint, testes, build)` e `Empacotamento do app (expo export)`.
   (Eles só aparecem na lista depois de a CI ter rodado pelo menos uma vez.)
6. Clique em **Create**.

Depois disso, envios diretos para a `main` passam a ser recusados: toda mudança precisará de
um pull request com a CI verde.
