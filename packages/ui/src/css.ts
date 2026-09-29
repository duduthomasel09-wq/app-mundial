import {
  COLOR_SCHEMES,
  colors,
  componentRadius,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  sizes,
  spacing,
  typography,
  type ColorScheme,
} from './tokens';

/**
 * Transforma os tokens em variáveis CSS para o painel web (ADR 0010).
 *
 * Nomes gerados (exemplos): `--color-brand`, `--color-text-muted`, `--space-md`,
 * `--radius-card`, `--font-size-sm`, `--font-weight-bold`, `--text-title-size`.
 */

const kebab = (value: string) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const px = (value: number) => (value >= 9999 ? '9999px' : `${value}px`);

export function colorVariables(scheme: ColorScheme): Record<string, string> {
  return Object.fromEntries(
    Object.entries(colors[scheme]).map(([key, value]) => [`--color-${kebab(key)}`, value]),
  );
}

export function staticVariables(): Record<string, string> {
  const vars: Record<string, string> = { '--font-sans': fontFamily.sans };
  for (const [key, value] of Object.entries(spacing)) vars[`--space-${key}`] = px(value);
  for (const [key, value] of Object.entries(radius)) vars[`--radius-${key}`] = px(value);
  for (const [key, value] of Object.entries(componentRadius)) vars[`--radius-${key}`] = px(value);
  for (const [key, value] of Object.entries(fontSize)) vars[`--font-size-${key}`] = px(value);
  for (const [key, value] of Object.entries(fontWeight)) vars[`--font-weight-${key}`] = value;
  for (const [key, style] of Object.entries(typography)) {
    vars[`--text-${key}-size`] = px(style.fontSize);
    vars[`--text-${key}-line-height`] = px(style.lineHeight);
    vars[`--text-${key}-weight`] = style.fontWeight;
  }
  for (const [key, value] of Object.entries(sizes)) vars[`--size-${kebab(key)}`] = px(value);
  return vars;
}

const block = (selector: string, vars: Record<string, string>) =>
  `${selector}{${Object.entries(vars)
    .map(([name, value]) => `${name}:${value};`)
    .join('')}}`;

/**
 * Folha de estilo com todas as variáveis: tema claro em `:root` e tema escuro
 * quando o sistema estiver no modo escuro.
 */
export function createCssVariables(): string {
  const [light, dark] = COLOR_SCHEMES;
  return [
    block(':root', { ...staticVariables(), ...colorVariables(light) }),
    `@media (prefers-color-scheme: dark){${block(':root', colorVariables(dark))}}`,
  ].join('\n');
}
