# @gfg/core

Tipos e regras de negócio compartilhados entre o app (`apps/mobile`) e o painel (`apps/admin`).
TypeScript puro: não depende de React, do Expo, do Next.js nem do Supabase.

| Arquivo            | Conteúdo                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| `src/geography.ts` | Idiomas, países, moedas e sistemas de unidades iniciais (ADR 0004)             |
| `src/plans.ts`     | Planos FREE/PLUS/PRO, status de assinatura, papéis e verificação de limites    |
| `src/units.ts`     | Conversão de peso, volume (medidas americanas) e temperatura, e arredondamento |

```ts
import { COUNTRIES, convertUnit, planIncludes } from '@gfg/core';

convertUnit(1, 'cup', 'ml'); // 236.588…
planIncludes('pro', 'plus'); // true
COUNTRIES.BR.defaultCurrency; // 'BRL'
```

> Os **limites** de cada plano não ficam aqui: eles virão da tabela `Entitlement` (PROJECT_SPEC, seção 6).

Comandos: `pnpm --filter @gfg/core test` · `typecheck` · `lint`.
