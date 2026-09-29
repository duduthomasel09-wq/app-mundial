/**
 * Tokens visuais compartilhados entre o app (React Native) e o painel (web) — ADR 0010.
 *
 * São só valores (cores em hexadecimal e números em pixels), sem componentes,
 * para funcionarem nas duas plataformas. Nenhuma tela deve usar cor, espaçamento,
 * fonte ou raio fixo: sempre um token daqui.
 */

export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export interface ColorPalette {
  /** Cor primária da marca (botões principais, links, destaques). */
  brand: string;
  /** Marca mais forte (botão principal pressionado). */
  brandStrong: string;
  /** Fundo suave da marca (selos, item de menu ativo). */
  brandSoft: string;
  /** Texto sobre `brand`. */
  onBrand: string;
  /** Fundo da tela. */
  background: string;
  /** Superfícies: cards, campos, menus. */
  surface: string;
  border: string;
  /** Texto principal. */
  text: string;
  /** Texto secundário/auxiliar. */
  textMuted: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
}

export const colors: Readonly<Record<ColorScheme, ColorPalette>> = {
  light: {
    brand: '#1F6F5C',
    brandStrong: '#17584A',
    brandSoft: '#E6F1EE',
    onBrand: '#FFFFFF',
    background: '#F6F7F6',
    surface: '#FFFFFF',
    border: '#E1E5E3',
    text: '#1B2420',
    textMuted: '#5D6B65',
    success: '#1E6B40',
    successSoft: '#E3F4EA',
    warning: '#7A4F00',
    warningSoft: '#FDF1D8',
    danger: '#B42318',
    dangerSoft: '#FDE7E5',
  },
  dark: {
    brand: '#4FB39A',
    brandStrong: '#6CC7B0',
    brandSoft: '#1C332D',
    onBrand: '#0B1512',
    background: '#111614',
    surface: '#1A211E',
    border: '#2B3531',
    text: '#E8EEEB',
    textMuted: '#9AA8A2',
    success: '#5CC98A',
    successSoft: '#16301F',
    warning: '#E8B44C',
    warningSoft: '#3A2C10',
    danger: '#F2877D',
    dangerSoft: '#3B1A17',
  },
};

/** Espaçamentos (px), numa escala de 4 em 4. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;
export type SpacingToken = keyof typeof spacing;

/** Arredondamento dos cantos (px). */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 9999,
} as const;

/** Raio de cada tipo de componente. */
export const componentRadius = {
  card: radius.lg,
  button: radius.md,
  input: radius.md,
  badge: radius.full,
  small: radius.sm,
} as const;

/** Tamanhos de fonte (px). */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  display: 56,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamily = {
  /** Fonte do sistema (web). No app, o React Native já usa a fonte do sistema. */
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: (typeof fontWeight)[keyof typeof fontWeight];
}

/** Estilos de texto prontos (tipografia). */
export const typography = {
  /** Título de tela. */
  title: { fontSize: fontSize.xl, lineHeight: 34, fontWeight: fontWeight.bold },
  /** Subtítulo / título de seção ou card. */
  subtitle: { fontSize: fontSize.lg, lineHeight: 26, fontWeight: fontWeight.semibold },
  /** Texto corrido. */
  body: { fontSize: fontSize.md, lineHeight: 24, fontWeight: fontWeight.regular },
  /** Rótulos de campos e botões. */
  label: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: fontWeight.semibold },
  /** Texto auxiliar (dicas, legendas, mensagens de erro). */
  caption: { fontSize: fontSize.xs, lineHeight: 16, fontWeight: fontWeight.regular },
} as const satisfies Record<string, TextStyleToken>;
export type TypographyVariant = keyof typeof typography;

/** Tamanhos de componentes (px). 44 = área mínima de toque recomendada. */
export const sizes = {
  controlHeight: 44,
  controlHeightSmall: 32,
  borderWidth: 1,
  focusRingWidth: 2,
} as const;

/** Devolve a paleta do tema pedido; sem tema (ou desconhecido), usa o claro. */
export function getColors(scheme: string | null | undefined): ColorPalette {
  return scheme === 'dark' ? colors.dark : colors.light;
}
