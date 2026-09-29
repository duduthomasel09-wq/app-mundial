# @gfg/ui — Design system mínimo

Base visual do Global Food Guide, usada pelo app e pelo painel (ADR 0010).

| Entrada          | O que tem                                                            | Quem usa     |
| ---------------- | -------------------------------------------------------------------- | ------------ |
| `@gfg/ui`        | **Tokens** (TypeScript puro, sem React) e regras de cor              | App e painel |
| `@gfg/ui/native` | Componentes React Native: Text, Button, Card, Input, Badge, Divider  | App mobile   |
| —                | Componentes web equivalentes ficam em `apps/admin/src/components/ui` | Painel       |

## Tokens (`src/tokens.ts`)

| Token                                  | Valores                                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colors.light/dark`                    | `brand`, `brandStrong`, `brandSoft`, `onBrand`, `background`, `surface`, `border`, `text`, `textMuted`, `success(+Soft)`, `warning(+Soft)`, `danger(+Soft)` |
| `typography`                           | `title` 28/34 bold · `subtitle` 20/26 semibold · `body` 16/24 · `label` 14/20 semibold · `caption` 12/16                                                    |
| `spacing`                              | `none` 0 · `xxs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32 · `xxxl` 48                                                                   |
| `radius`                               | `sm` 6 · `md` 10 · `lg` 14 · `full`                                                                                                                         |
| `componentRadius`                      | `card` 14 · `button` 10 · `input` 10 · `badge` full · `small` 6                                                                                             |
| `sizes`                                | `controlHeight` 44 (área mínima de toque) · `controlHeightSmall` 32 · `borderWidth` 1                                                                       |
| `fontSize`, `fontWeight`, `fontFamily` | escala base usada pela tipografia                                                                                                                           |

Regras de cor por componente (`src/variants.ts`): `textColor`, `buttonColors`, `badgeColors`,
`inputColors`. Contraste (`src/contrast.ts`): `contrastRatio()` — um teste garante no mínimo
4,5:1 (WCAG AA) para textos, botões e selos nos dois temas.

## Componentes

| Componente | Variantes / estados                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `Text`     | `variant`: title, subtitle, body, label, caption · `tone`: default, muted, brand, success, warning, danger · `align` |
| `Button`   | `variant`: primary, secondary, ghost, danger · `disabled` · `loading` · `fullWidth`                                  |
| `Card`     | superfície com borda e cantos `card`                                                                                 |
| `Input`    | `label` · `hint` · `error` (borda e mensagem vermelhas) · `disabled`                                                 |
| `Badge`    | `tone`: neutral, brand, success, warning, danger                                                                     |
| `Divider`  | linha fina; no app, `space` controla a margem                                                                        |

### No app (React Native)

```tsx
import { spacing } from '@gfg/ui';
import { Button, Card, Text, useTheme } from '@gfg/ui/native';

const { colors } = useTheme(); // claro/escuro conforme o celular

<Card>
  <Text variant="subtitle">Título</Text>
  <Text tone="muted">Descrição</Text>
  <Button label="Salvar" loading={saving} onPress={save} />
</Card>;
```

Em modo de desenvolvimento, o app tem a tela **"Ver design system"** (`/design-system`)
com todos os componentes — ela não aparece na versão publicada.

### No painel (web)

```tsx
import { Badge, Button, Card, Input, Text } from '@/components/ui';

<Card>
  <Text as="h2" variant="subtitle">
    Título
  </Text>
  <Input name="email" label="E-mail" error="Digite um e-mail válido." />
  <Button variant="secondary">Cancelar</Button>
</Card>;
```

No CSS do painel, use as variáveis geradas dos tokens (`createCssVariables()`, injetadas no
layout raiz): `var(--color-brand)`, `var(--space-md)`, `var(--radius-card)`,
`var(--text-body-size)`, `var(--size-control-height)`…

## Regras

- **Nada de valores fixos** de cor, espaçamento, fonte ou raio em telas e CSS: use um token.
- Mudou uma variante? Ajuste o componente **nos dois lugares** (native e web).
- A entrada principal `@gfg/ui` não pode importar React (um teste verifica isso).

Comandos: `pnpm --filter @gfg/ui test` · `typecheck` · `lint`.
