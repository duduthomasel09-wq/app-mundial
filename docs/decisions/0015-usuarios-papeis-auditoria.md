# ADR 0015 — Usuários, papéis e auditoria (Fase 1, etapa 1.1)

- **Status:** Aprovada (30/09/2026) — implementada e aplicada no desenvolvimento (01/10/2026)
- **Relaciona-se com:** ADR 0006 (painel), ADR 0013 (ambientes), ADR 0014 (migrations no dev),
  ADR 0012 (CI — ganha o job de testes de banco)

## Contexto

A Fase 1 começa pela base de contas: perfil com idioma/país/moeda, papéis para o painel e
registro de auditoria, com RLS obrigatório (PROJECT_SPEC 2.1, 2.6 e 3.4). As decisões gerais da
Fase 1 foram aprovadas em conversa e ainda não estavam registradas em nenhuma ADR.

## Decisões gerais da Fase 1 (registradas aqui)

1. **Login inicial:** e-mail + senha. Google e Apple ficam para antes do beta (exigem EAS e conta Apple).
2. **Conteúdo público sem conta:** qualquer pessoa vê e pesquisa conteúdo público; recursos que
   exigirem conta pedem login.
3. **Painel admin:** login real pelo Supabase Auth; permissões por **sessão + RLS**;
   `editor` e `admin` com permissões diferentes; **nunca `service_role` no navegador**.
4. **Open Food Facts:** só preparado nesta fase (sem importação em massa, sem integração real).
5. **Lista de compras:** depois do núcleo da Fase 1.
6. **Confirmação de e-mail:** ligada no desenvolvimento e na produção; desligada só no ambiente
   local (`supabase/config.toml`).
7. **Produção:** não é criada agora.

## Decisões do modelo (migration `20260930120000_usuarios_papeis_auditoria.sql`)

| Tema                       | Decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — Papéis**            | `user` é o padrão. `user_roles` guarda **só** `editor` e `admin` (tipo `app_role`). Sem linha = `user`. `@gfg/core` mantém `ROLES` e ganha `STAFF_ROLES`.                                                                                                                                                                                                                                                                                                                                     |
| **H2 — Hierarquia**        | `admin` tem também as permissões de `editor` (`has_role('editor')` é verdadeiro para admin). Um usuário pode ter os dois papéis.                                                                                                                                                                                                                                                                                                                                                              |
| **H3 — Cadastro**          | O app envia `locale` e `country_code` (e opcionalmente `display_name`) no `signUp`. O gatilho **valida** contra as tabelas de referência. Ausente/inválido → `locale = 'en'`, país vazio. `currency_code` e `unit_system` são **derivados do país**. O cadastro **nunca** falha por causa de metadados.                                                                                                                                                                                       |
| **H4 — Onboarding**        | Obrigatório. Coluna `onboarding_completed_at`; só pode ser preenchida com país, moeda e unidades definidos (restrição no banco).                                                                                                                                                                                                                                                                                                                                                              |
| **H5 — Dietas**            | `dietary_preferences text[] default '{}'`, sem lista fechada nem validação por enquanto.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **H6 — Auditoria**         | `audit_log` imutável (ninguém grava/altera/apaga pela API; só admin lê). Nesta etapa audita `user_roles`. Alterações pessoais em `profiles` **não** são auditadas. Conteúdo será auditado quando as tabelas existirem.                                                                                                                                                                                                                                                                        |
| **H7 — Último admin**      | O sistema **nunca fica com zero admins ativos** (admin ativo = papel `admin` com a conta existente e sem `deleted_at`). São bloqueados: revogar/rebaixar o último admin; **excluir a conta** dele em `auth.users` (gatilho próprio, antes do `CASCADE`, que continua valendo); a **exclusão "suave"** (`deleted_at`); `TRUNCATE` em `user_roles` (inclusive via `TRUNCATE auth.users CASCADE`); e excluir todos os admins num único comando. Admin com conta excluída "suavemente" não conta. |
| **H8 — Exclusão de conta** | `deleted_at` e exclusão/exportação de conta ficam para a **Fase 2**.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **H9 — Testes**            | Testes **pgTAP** num **Supabase real local** (Docker) na CI — job "Banco de dados" em `ci.yml` (atualização da ADR 0012).                                                                                                                                                                                                                                                                                                                                                                     |
| **Primeiro admin**         | Criado por um comando SQL documentado (`docs/SUPABASE.md`), inicialmente só no desenvolvimento.                                                                                                                                                                                                                                                                                                                                                                                               |

## Detalhes de segurança

- RLS ligado em `profiles`, `user_roles` e `audit_log`; políticas usam `(select auth.uid())`.
- Permissões explícitas além da RLS: `profiles` só permite `update` nas colunas editáveis (ninguém
  muda `user_id`/`created_at`) e não permite `insert`/`delete` pela API; `user_roles` só permite
  `insert (user_id, role)` — `granted_by` é sempre a sessão; `audit_log` só `select`.
- Funções `security definer` (`has_role`, `handle_new_user`, `audit_row_change`,
  `protect_last_admin`) com `search_path = ''` e nomes completos; funções de gatilho sem
  permissão de execução para `anon`/`authenticated`.
- Nenhuma política depende de `service_role`.
- Os metadados do cadastro vêm do usuário: só `locale`, `country_code` e `display_name` são lidos,
  sempre validados; **papéis nunca vêm de metadados**.

## Consequências

- Para excluir (ou marcar como excluída) a conta do último admin ativo, é preciso promover
  outro admin antes — inclusive pelo painel do Supabase ou pela API de administração do Auth,
  que recebem o erro "Não é possível excluir a conta do último admin.".
- Limite conhecido: o **dono do banco** ainda pode contornar gatilhos (ex.: desativá-los ou
  `session_replication_role = replica`). A proteção cobre a API e as operações normais, não um
  superusuário agindo de propósito. Banir a conta (`banned_until`) não é tratado como exclusão.
- `audit_log` guarda cópias de dados (`old_data`/`new_data`). Retenção e anonimização serão
  definidas com a política de privacidade (D14, Fase 2).
- A aplicação no desenvolvimento segue a ADR 0014 (workflow `verificar` → `aplicar`).
