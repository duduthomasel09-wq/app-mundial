# ADR 0013 — Ambientes de desenvolvimento e produção

- **Status:** Aprovada (29/09/2026) — etapa 11 da Fase 0 aprovada e concluída · item 3
  atualizado pela [ADR 0017](0017-recuperacao-senha-painel.md): a sessão sem login vale só em
  `development` (também é bloqueada em `staging`)
- **Relaciona-se com:** ADR 0006 (bloqueio prometido para a etapa 11), ADR 0008 (substitui o
  item 5 — dados de referência no seed), ADR 0011 (ambientes e variáveis)

## Contexto

Existe só o projeto Supabase de desenvolvimento. Antes de haver produção, o projeto precisa de
regras que impeçam misturar dados de teste com dados reais e configurações inseguras em produção.
A ADR 0006 prometeu que a etapa 11 impediria o painel sem login em produção.

## Decisão

1. **Dois ambientes ativos:** `development` e `production`. `staging` continua aceito no código
   (ADR 0011), mas sem projeto próprio nesta fase.
2. **Dois projetos Supabase separados** (senhas, chaves e secrets próprios). O de produção
   (`global-food-guide-prod`) **não é criado agora** — só documentado em `docs/AMBIENTES.md`.
3. **`ADMIN_AUTH_MODE=disabled` é bloqueado em produção:** a sessão simulada é recusada, o
   painel envia para `/login`, o atalho "modo desenvolvimento" não aparece e um erro é
   registrado no log. O build não é impedido.
4. **Dados de referência (idiomas, moedas, países) viram migration idempotente**
   (`20260929130000_dados_referencia.sql`), chegando a todos os ambientes pelo fluxo normal.
5. **O seed fica reservado para dados fictícios de desenvolvimento.**
6. **`--include-seed` é proibido em produção** (documentado em AMBIENTES.md, SUPABASE.md e no seed).
7. **Promoção para produção manual** nesta etapa, com checklist e `db push --dry-run`.
   Workflow com aprovação no GitHub fica para quando a produção existir.
8. **Selo "Desenvolvimento"** no painel (menu e login) e no app (tela inicial) sempre que
   `APP_ENV` não for `production`.
9. **URL `localhost`/`127.0.0.1` em produção é erro de configuração:** a URL é descartada e um
   erro é registrado (`rejectLocalUrlInProduction` em `@gfg/core`).
10. **Regras de operação:** chaves de produção nunca no computador; nunca SQL Editor em produção;
    sempre conferir o projeto ligado antes de `db push`.

## Situação ao concluir a etapa 11

| Item                                  | Situação                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Ambientes ativos                      | `development` e `production`                                                       |
| Projeto Supabase de produção          | **Ainda não criado** (passo a passo em `docs/AMBIENTES.md`)                        |
| `staging`                             | **Reservado**: aceito no código, sem projeto                                       |
| `migration repair` no desenvolvimento | **Pendente** (`--status applied 20260929120000`), a ser feito pelo dono do projeto |
| Deploy para produção                  | **Não há deploy automático**                                                       |
| Promoção para produção                | **Manual** nesta fase, com checklist e `db push --dry-run`                         |

## Consequências

- O projeto de desenvolvimento precisa de `migration repair --status applied 20260929120000`
  (só anota o histórico, sem mudar dados) antes do próximo `db push`; depois, a migration de
  dados de referência é aplicada sem duplicar nada.
- A ADR 0008, item 5 ("dados de referência no seed"), fica substituída por esta ADR.
- Criar o projeto de produção exige seguir `docs/AMBIENTES.md` (inclui voltar o link para o dev).

## Atualização (30/09/2026) — ADR 0014

- O `migration repair` do desenvolvimento **foi concluído** em 30/09/2026 (e a migration de
  dados de referência aplicada), pelo GitHub Actions.
- O caminho oficial para aplicar migrations no **desenvolvimento** passa a ser o workflow
  manual **Supabase dev — migrations** (ADR 0014). A promoção para **produção** continua manual.
