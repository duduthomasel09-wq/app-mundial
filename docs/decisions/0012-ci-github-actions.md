# ADR 0012 — CI com GitHub Actions

- **Status:** Aprovada (29/09/2026) — etapa 10 da Fase 0

## Contexto

Até a etapa 9, todas as verificações (formatação, tipos, lint, testes, build e empacotamento
do app) eram rodadas manualmente antes de cada envio. O projeto precisa de uma verificação
automática, confiável, sem secrets e sem deploy.

## Decisão

1. **Um workflow** (`.github/workflows/ci.yml`) com **dois jobs em paralelo**:
   - **Verificações:** `pnpm install --frozen-lockfile` → `format:check` → `typecheck` →
     `lint` → `test` → `build`;
   - **Empacotamento do app:** `expo export` para Android e iOS (resultado descartado).
2. **CI completa sempre**, sem `--affected` do Turborepo: a verificação inteira leva menos de
   um minuto e não corre o risco de pular algo afetado por mudanças na raiz.
3. **Gatilhos:** `pull_request` para `main`, `push` na `main` e `workflow_dispatch` (manual).
   `pull_request_target` não é usado.
4. **Segurança:** permissão `contents: read`; nenhum secret; `persist-credentials: false`;
   actions de terceiros fixadas pelo **SHA do commit** com a versão em comentário.
5. **Ambiente:** Node pelo `.nvmrc` (22) e pnpm pelo `packageManager` (10.28.0), com cache do
   pnpm pelo `actions/setup-node`. Sem cache remoto do Turborepo (exigiria token da Vercel).
   Telemetria das ferramentas desligada.
6. **Fora desta etapa:** teste das migrations (Fase 1), EAS, Vercel, Supabase de produção,
   deploy e `expo-doctor`.
7. **Fluxo de trabalho mantido:** envios diretos na `main` continuam permitidos; a CI roda
   depois e avisa. A proteção da branch (exigir CI verde via pull request) está só
   **documentada** em `docs/CI.md`, não ativada.

## Decisões aprovadas (resumo)

| Tema               | Decisão aprovada                                                   |
| ------------------ | ------------------------------------------------------------------ |
| Escopo da CI       | CI **completa sempre**, sem `--affected`                           |
| App mobile         | **Inclui** `expo export` (Android e iOS) em job separado           |
| Versões de actions | **Fixadas por SHA** do commit, com a versão em comentário          |
| Gatilhos           | `pull_request` para `main`, `push` na `main` e `workflow_dispatch` |
| Proteção da `main` | **Não ativada** neste momento; só documentada em `docs/CI.md`      |
| Fluxo de trabalho  | Envios diretos na `main` continuam permitidos                      |

## Consequências

- Todo envio para a `main` passa pelas mesmas verificações, com resultado visível no GitHub.
- Enquanto a proteção da branch não for ativada, a CI **avisa** mas **não impede** um envio
  quebrado — continua valendo rodar as verificações localmente antes de enviar.
- Atualizar uma action exige trocar o SHA e o comentário juntos.

## Atualização (30/09/2026) — ADR 0015

A CI ganhou um **terceiro job**, "Banco de dados (migrations + testes pgTAP)":

- sobe um **Supabase local e temporário** (Docker do servidor do GitHub, sem secrets e sem acesso
  a nenhum projeto remoto) com o Supabase CLI fixo em 2.118.0 e `supabase/setup-cli` fixado por SHA;
- aplica todas as migrations e o seed;
- roda `supabase db lint` (falha em erros) e os testes pgTAP de `supabase/tests/` (`supabase test db`);
- desliga e apaga o banco temporário no final.

As demais decisões desta ADR continuam iguais (gatilhos, permissões, actions por SHA, CI completa).
