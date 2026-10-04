# supabase

Banco de dados, migrations, dados iniciais e Edge Functions do Global Food Guide.
Tudo aqui segue o formato do **Supabase CLI**. Como conectar e rodar: [docs/SUPABASE.md](../docs/SUPABASE.md).

```
supabase
├── config.toml                  Configuração do ambiente local (portas, auth, funções) — sem chaves
├── migrations/                  Mudanças no banco, em ordem (nunca edite uma já aplicada)
│   ├── 20260929120000_fundacao.sql          Extensões de busca, set_updated_at() e tabelas de referência
│   ├── 20260929130000_dados_referencia.sql  3 idiomas, 4 moedas e 5 países (idempotente — ADR 0013)
│   └── 20260930120000_usuarios_papeis_auditoria.sql  profiles, user_roles, has_role(), audit_log (ADR 0015)
├── tests/database/              Testes pgTAP de RLS e segurança (rodam na CI: `supabase test db`)
├── templates/recovery.html      E-mail de recuperação de senha do painel (só local — ADR 0017)
├── seed/                        SÓ DESENVOLVIMENTO: dados fictícios (proibido em produção)
│   └── 01_referencia.sql        Sem dados por enquanto (os de referência viraram migration)
└── functions/                   Edge Functions (Deno)
    ├── .env.example             Modelo dos segredos das funções (nenhum necessário ainda)
    ├── _shared/cors.ts          Cabeçalhos CORS compartilhados
    └── health/index.ts          Responde {"status":"ok"} — só testa a estrutura
```

## O que existe no banco

| Tabela       | Conteúdo                                              | Quem lê                    | Quem escreve                                                   |
| ------------ | ----------------------------------------------------- | -------------------------- | -------------------------------------------------------------- |
| `locales`    | Idiomas (pt-BR, en, es)                               | Todos (público)            | Só migrations (e o admin)                                      |
| `currencies` | Moedas (BRL, USD, EUR, GBP)                           | Todos (público)            | Só migrations (e o admin)                                      |
| `countries`  | Países (BR, US, PT, ES, GB)                           | Todos (público)            | Só migrations (e o admin)                                      |
| `profiles`   | Perfil: idioma, país, moeda, unidades, onboarding     | O dono e admins            | O dono (só colunas editáveis); criado pelo gatilho do cadastro |
| `user_roles` | Papéis `editor` / `admin` (sem linha = usuário comum) | O próprio usuário e admins | Só admin (nunca fica sem admin ativo)                          |
| `audit_log`  | Histórico imutável de alterações do painel            | Só admin                   | Só gatilhos (ninguém pela API)                                 |

Todas as tabelas têm **Row Level Security** ligado. Função `has_role('editor'|'admin')` para as
políticas (admin também vale como editor). Conteúdo (ingredientes, produtos, receitas…) chega nas
próximas etapas da Fase 1.

## Regras

- **Nova mudança no banco = nova migration.** Crie com `supabase migration new <nome>`.
- **Toda tabela nova com RLS precisa de testes** em `tests/database/` (a CI roda `supabase test db`).
- **Aplicar no desenvolvimento:** workflow do GitHub **Supabase dev — migrations**
  (`verificar` → `aplicar`) — veja [docs/CI.md](../docs/CI.md) e a ADR 0014.
- Os códigos de `migrations/20260929130000_dados_referencia.sql` devem ser iguais aos de
  `packages/core/src/geography.ts`.
- **Seed só no desenvolvimento.** `--include-seed` é **proibido em produção**; dados necessários
  em produção vão em migration. Dev × produção: [docs/AMBIENTES.md](../docs/AMBIENTES.md).
- Nenhuma senha ou chave neste diretório. Segredos das funções: `supabase/functions/.env` (local)
  ou `supabase secrets set` (nuvem).
