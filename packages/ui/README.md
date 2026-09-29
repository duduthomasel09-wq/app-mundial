# @gfg/ui

Base visual compartilhada entre o app e o painel.

Por enquanto contém só **tokens** (`src/tokens.ts`): cores dos temas claro e escuro,
espaçamentos, cantos arredondados e tamanhos de fonte. São valores simples, sem componentes,
para funcionarem tanto no React Native quanto na web.

```ts
import { getColors, spacing } from '@gfg/ui';

const palette = getColors('dark');
palette.brand; // '#4FB39A'
```

> Os componentes (botões, cartões, campos) e a revisão visual chegam na **etapa 8**
> (Design system mínimo).

Comandos: `pnpm --filter @gfg/ui test` · `typecheck` · `lint`.
