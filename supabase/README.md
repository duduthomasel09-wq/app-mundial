# supabase

Banco de dados, migrations, dados iniciais e Edge Functions do Global Food Guide.
Tudo aqui segue o formato do **Supabase CLI**. Como conectar e rodar: [docs/SUPABASE.md](../docs/SUPABASE.md).

```
supabase
├── config.toml                  Configuração do ambiente local (portas, auth, funções) — sem chaves
├── migrations/                  Mudanças no banco, em ordem (nunca edite uma já aplicada)
│   └── 20260929120000_fundacao.sql   Extensões de busca, set_updated_at() e idiomas/moedas/países
├── seed/                        Dados iniciais (rodam no `supabase db reset`)
│   └── 01_referencia.sql        3 idiomas, 4 moedas e 5 países (ADR 0004)
└── functions/                   Edge Functions (Deno)
    ├── .env.example             Modelo dos segredos das funções (nenhum necessário ainda)
    ├── _shared/cors.ts          Cabeçalhos CORS compartilhados
    └── health/index.ts          Responde {"status":"ok"} — só testa a estrutura
```

## O que existe no banco

| Tabela       | Conteúdo                    | Quem lê         | Quem escreve                   |
| ------------ | --------------------------- | --------------- | ------------------------------ |
| `locales`    | Idiomas (pt-BR, en, es)     | Todos (público) | Só migrations/seed (e o admin) |
| `currencies` | Moedas (BRL, USD, EUR, GBP) | Todos (público) | Só migrations/seed (e o admin) |
| `countries`  | Países (BR, US, PT, ES, GB) | Todos (público) | Só migrations/seed (e o admin) |

Todas as tabelas têm **Row Level Security** ligado. As tabelas do app (usuários, produtos,
receitas, assinaturas…) chegam na Fase 1.

## Regras

- **Nova mudança no banco = nova migration.** Crie com `supabase migration new <nome>`.
- Os códigos de `seed/01_referencia.sql` devem ser iguais aos de `packages/core/src/geography.ts`.
- Nenhuma senha ou chave neste diretório. Segredos das funções: `supabase/functions/.env` (local)
  ou `supabase secrets set` (nuvem).
