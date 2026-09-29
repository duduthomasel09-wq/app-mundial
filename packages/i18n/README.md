# @gfg/i18n

Internacionalização compartilhada entre o app e o painel.

| Arquivo         | Conteúdo                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| `src/locale.ts` | `resolveLocale()` — escolhe `pt-BR`, `en` ou `es` a partir do idioma pedido |
| `src/format.ts` | `formatNumber()`, `formatCurrency()` e `formatDate()` com a API `Intl`      |

```ts
import { formatCurrency, resolveLocale } from '@gfg/i18n';

resolveLocale('pt-PT'); // 'pt-BR'
formatCurrency(9.9, 'BRL', 'pt-BR'); // 'R$ 9,90'
```

> Os arquivos de tradução da interface (`locales/pt-BR.json`, `en.json`, `es.json`) e a
> configuração do i18next chegam na **etapa 7**.

Comandos: `pnpm --filter @gfg/i18n test` · `typecheck` · `lint`.
