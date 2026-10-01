# Ambientes: desenvolvimento e produção

Guia de como o projeto separa **desenvolvimento** de **produção** (ADR 0013).
Variáveis de cada ambiente: [ENVIRONMENT.md](ENVIRONMENT.md) · Supabase: [SUPABASE.md](SUPABASE.md).

## Resumo

|                           | Desenvolvimento                                       | Produção                                               |
| ------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| `APP_ENV`                 | `development` (padrão)                                | `production`                                           |
| Projeto Supabase          | `global-food-guide-dev` (já existe)                   | `global-food-guide-prod` (**ainda não criado**)        |
| Onde ficam as variáveis   | `.env.local` no seu computador                        | Só na hospedagem / GitHub — **nunca** no computador    |
| Dados                     | Fictícios, podem ser apagados                         | Reais — nunca misturar com teste                       |
| Aplicar migrations        | Workflow **Supabase dev — migrations** (ADR 0014)     | Manual, com checklist (futuro: workflow com aprovação) |
| Seed (`--include-seed`)   | Permitido                                             | **PROIBIDO**                                           |
| Confirmação de e-mail     | **Ligada** (ADR 0015; desligada só no Supabase local) | **Ligada**                                             |
| Login do painel           | `ADMIN_AUTH_MODE=disabled` permitido                  | `disabled` é **bloqueado** (vai para /login)           |
| Selo "Desenvolvimento"    | Aparece no painel e no app                            | Não aparece                                            |
| URL `localhost/127.0.0.1` | Permitida (Supabase local)                            | **Erro** de configuração (URL descartada)              |

`staging` (teste/homologação) continua aceito no código, mas **não tem projeto** nesta fase.

## Regras de ouro

1. **Chaves de produção nunca ficam no seu computador** (`.env.local` aponta só para o dev).
2. **Nunca use o SQL Editor em produção.** Toda mudança no banco é uma migration.
3. **Nunca use `--include-seed` em produção.** O seed é só para dados fictícios.
4. **Sempre** teste no desenvolvimento antes de levar para produção.
5. **Sempre** confira qual projeto está ligado antes de um `db push`.

## Histórico do projeto de desenvolvimento: `migration repair` ✅ concluído

As tabelas do dev foram criadas pelo **SQL Editor** (SUPABASE.md, seção 2.3-B), então o histórico
de migrations do projeto estava vazio. Em **30/09/2026**, pelo GitHub Actions (ADR 0014):

1. `migration repair --status applied 20260929120000` — só anotou no histórico que a fundação já
   estava aplicada (não mudou tabelas nem dados);
2. `db push` — aplicou a `20260929130000_dados_referencia` (idempotente: não duplicou nada).

Resultado: as duas migrations aparecem em **Local** e **Remote**. Não há mais pendência.

## Fluxo de uma mudança no banco

1. Crie o arquivo em `supabase/migrations/` (ou `npx supabase migration new nome_da_mudanca`)
   e escreva o SQL.
2. Commit na `main` → a CI verifica o código.
3. Aplique no **desenvolvimento** pelo GitHub (caminho oficial — ADR 0014):
   **Actions** → **Supabase dev — migrations** → **Run workflow**:
   - primeiro com **`verificar`**: leia o dry-run (quais migrations seriam aplicadas);
   - se estiver certo, rode de novo com **`aplicar`**.

   Alternativa: Supabase CLI no seu computador (`link` + `db push --dry-run` + `db push`).

4. Confira o resultado no site do Supabase (**Table Editor**).
5. Leve para **produção** com o checklist abaixo (quando a produção existir).

Nunca edite uma migration que já foi aplicada em algum ambiente: crie outra.

## Checklist: promover migrations para produção (manual)

Use só quando o projeto de produção existir. Faça com calma, um passo por vez.

- [ ] A mudança já foi aplicada e conferida no **desenvolvimento**.
- [ ] A CI está ✅ no último commit da `main`.
- [ ] `npx supabase projects list` → confira qual projeto tem o **●** (ligado).
- [ ] `npx supabase link --project-ref SEU_ID_DE_PRODUCAO` (pede a senha **de produção**).
- [ ] `npx supabase projects list` → o ● agora está em **global-food-guide-prod**.
- [ ] `npx supabase db push --dry-run` → leia a lista: só as migrations esperadas?
      **Sem** `--include-seed`.
- [ ] `npx supabase db push` → confirme com `Y`.
- [ ] `npx supabase migration list` → as migrations aparecem em **Local** e **Remote**.
- [ ] **Volte o link para o desenvolvimento:** `npx supabase link --project-ref SEU_ID_DO_DEV`.

## Seed

- `supabase/seed/` é **só desenvolvimento**: dados fictícios de exemplo.
- Roda no `db reset` (local) e no dev com `npx supabase db push --include-seed`.
- **Proibido em produção.** Dados necessários em produção (como idiomas, moedas e países)
  vão em **migration** (ex.: `20260929130000_dados_referencia.sql`).

## Edge Functions

1. Publique no **desenvolvimento**: `npx supabase functions deploy NOME --project-ref SEU_ID_DO_DEV`.
2. Teste (ex.: `https://SEU_ID_DO_DEV.supabase.co/functions/v1/health`).
3. Publique em **produção**: o mesmo comando com `--project-ref SEU_ID_DE_PRODUCAO`.

- A regra de exigir login (`verify_jwt`) vem do `supabase/config.toml` e vale nos dois.
- **Secrets são separados por projeto:** `npx supabase secrets set NOME=valor --project-ref ...`.
  Nunca reutilize um secret de desenvolvimento em produção.

## Como criar o projeto de produção (futuro — ainda NÃO fazer)

Quando for a hora (antes do beta):

1. supabase.com → **New project** → **Name:** `global-food-guide-prod`, mesma organização,
   **Region:** South America (São Paulo), senha **nova e diferente** da do dev (guarde num
   gerenciador de senhas).
2. `link` no projeto novo e `npx supabase db push` (**sem** `--include-seed`): todas as
   migrations são aplicadas, inclusive os dados de referência.
3. Publique as Edge Functions (seção acima).
4. Cadastre as variáveis públicas de produção (`APP_ENV=production`, URL e chave **pública**
   de produção) **só** na hospedagem/serviço de build — nunca em `.env.local`.
5. **Authentication → Email:** confirmação de e-mail **ligada** (ADR 0015).
6. **Primeiro admin de produção:** o procedimento será definido e aprovado quando a produção
   existir (o SQL Editor não é usado em produção — ADR 0013).
7. Volte o link do CLI para o desenvolvimento.

## Futuro: GitHub Actions

Quando o projeto de produção existir, a promoção manual poderá virar um workflow do GitHub
com aprovação — veja [CI.md](CI.md), seção "Futuro: promoção para produção".
