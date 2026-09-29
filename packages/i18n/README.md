# @gfg/i18n

Internacionalização compartilhada entre o app e o painel (PROJECT_SPEC, seção 3.3).

| Arquivo              | Conteúdo                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `locales/pt-BR.json` | Textos da interface em português — **arquivo de referência**                |
| `locales/en.json`    | Textos em inglês (também é o idioma de _fallback_)                          |
| `locales/es.json`    | Textos em espanhol                                                          |
| `src/instance.ts`    | `createI18n()` e `getTranslator()` — configuração do **i18next**            |
| `src/resources.ts`   | Junta os arquivos de tradução e dá tipos às chaves (`t('...')` verificado)  |
| `src/locale.ts`      | `resolveLocale()` — escolhe `pt-BR`, `en` ou `es` a partir do idioma pedido |
| `src/format.ts`      | `formatNumber()`, `formatCurrency()` e `formatDate()` com a API `Intl`      |

## Como usar

```ts
// Servidor (painel admin): idioma fixo
import { getTranslator } from '@gfg/i18n';
const t = getTranslator('pt-BR');
t('admin.login.title'); // "Entrar"
t('common.countryCount', { count: 5 }); // "5 países"

// App (React): uma instância + react-i18next
import { createI18n } from '@gfg/i18n';
const i18n = createI18n('es'); // <I18nextProvider i18n={i18n}> ... useTranslation()
```

## Organização das chaves

| Grupo      | Para quê                                                         |
| ---------- | ---------------------------------------------------------------- |
| `common.*` | Textos usados no app **e** no painel (nome do app, países…)      |
| `mobile.*` | Só no app mobile, separado por tela (`mobile.home.*`)            |
| `admin.*`  | Só no painel, separado por área (`admin.login.*`, `admin.nav.*`) |

## Como adicionar ou mudar um texto

1. Adicione a chave em `locales/pt-BR.json`.
2. Adicione a **mesma chave** em `en.json` e `es.json`.
3. Rode `pnpm --filter @gfg/i18n test`. O teste avisa se faltar uma chave, se um texto estiver
   vazio ou se as variáveis `{{...}}` forem diferentes entre os idiomas.

**Variáveis:** `"Idioma: {{language}}"` → `t('mobile.home.language', { language: 'Español' })`.

**Plural:** crie uma chave por forma, com sufixo. Português e espanhol usam `_one`, `_many` e
`_other` (`_many` aparece em números como 1 milhão: "1.000.000 de países"); inglês usa
`_one` e `_other`. Chame sempre com `count`: `t('common.countryCount', { count: 5 })`.

> Estes arquivos traduzem só a **interface**. O **conteúdo** (receitas, produtos…) terá
> tradução no banco (tabelas `*Translation`), a partir da Fase 1.

Comandos: `pnpm --filter @gfg/i18n test` · `typecheck` · `lint`.
