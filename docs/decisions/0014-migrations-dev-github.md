# ADR 0014 — Fluxo oficial de migrations no desenvolvimento (GitHub Actions)

- **Status:** Aprovada (30/09/2026) — workflow testado com sucesso no modo `verificar`
- **Relaciona-se com:** ADR 0012 (CI e padrão de actions), ADR 0013 (ambientes dev/prod)

## Contexto

As ADRs 0008 e 0013 previam aplicar migrations com o Supabase CLI no computador do dono do
projeto. Em 30/09/2026, sem Node/Git/CLI no computador, o `migration repair` e o `db push` do
projeto de desenvolvimento foram feitos por um workflow criado pelo site do GitHub
(`.github/workflows/main.yml`). Ele funcionou, mas:

- usava o token do Supabase como **secret de todo o repositório**, sem separar ambientes;
- tinha o **ID do projeto escrito no arquivo**;
- usava actions sem versão fixa (`@v4`, `@v1`) e o CLI em `latest` (contra a ADR 0012);
- aplicava migrations **sem dry-run** antes;
- tinha um nome genérico (`main.yml`).

## Decisão

1. **Caminho oficial para migrations no desenvolvimento:** o workflow manual
   `.github/workflows/supabase-dev-migrations.yml` ("Supabase dev — migrations").
   O Supabase CLI no computador continua como alternativa (docs/AMBIENTES.md).
2. **GitHub Environment `development`**, com:
   - secret `SUPABASE_ACCESS_TOKEN` (token do Supabase);
   - variável `SUPABASE_PROJECT_REF` (ID do projeto de desenvolvimento — fora do código);
   - regra de branch: só a `main`.
3. **Dois modos**, escolhidos ao rodar:
   - `verificar` (padrão): `migration list` + `db push --dry-run` — não muda nada;
   - `aplicar`: `migration list` + `db push --dry-run` + `db push --yes` + `migration list`.
     Só é aceito a partir da `main`.
4. **Padrão de segurança da ADR 0012:** actions fixadas por SHA (versão em comentário),
   `permissions: contents: read`, `persist-credentials: false`. Supabase CLI fixo em
   **2.118.0**. Sem senha do banco: o CLI usa o token (login role temporário).
5. **Proteções extras:** nunca duas execuções simultâneas (`concurrency`, sem cancelar no
   meio); limite de 10 minutos; o workflow para com erro claro se o secret ou a variável
   estiverem ausentes ou se o ID não tiver o formato esperado.
6. **Nunca** `--include-seed` nem `--include-all` neste workflow.
7. **Não existe workflow de produção.** Quando a produção existir, terá Environment próprio
   (`production`) com aprovação obrigatória (docs/CI.md).
8. O workflow antigo `main.yml` é **removido**.

## Situação ao adotar esta ADR

- Projeto de desenvolvimento: `20260929120000` (repair) e `20260929130000` (push) já constam
  no histórico remoto — confirmado pelos registros das execuções de 30/09/2026.
- O secret antigo `SUPABASE_ACCESS_TOKEN` **do repositório** continua existindo até o novo
  workflow ser testado; removê-lo (e revogar o token antigo, se um novo foi criado) é uma
  ação manual do dono do projeto, feita depois, com autorização.

## Consequências

- Aplicar uma migration no dev = rodar o workflow em `verificar`, ler o dry-run, rodar em
  `aplicar`.
- Atualizar o CLI ou uma action exige trocar a versão/SHA e o comentário juntos.
- O mesmo token não deve ser reutilizado em produção.
