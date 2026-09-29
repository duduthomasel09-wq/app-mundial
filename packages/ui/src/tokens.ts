/**
 * Tokens visuais compartilhados entre o app (React Native) e o painel (web).
 *
 * São só valores (cores em hexadecimal e números em pixels), sem componentes,
 * para funcionarem nas duas plataformas. Os componentes e a revisão visual
 * completa chegam na etapa 8 (Design system mínimo).
 */

export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export interface ColorPalette {
  brand: string;
  brandStrong: string;
  brandSoft: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
}

export const colors: Readonly<Record<ColorScheme, ColorPalette>> = {
  light: {
    brand: '#1F6F5C',
    brandStrong: '#17584A',
    brandSoft: '#E6F1EE',
    background: '#F6F7F6',
    surface: '#FFFFFF',
    border: '#E1E5E3',
    text: '#1B2420',
    textMuted: '#5D6B65',
  },
  dark: {
    brand: '#4FB39A',
    brandStrong: '#6CC7B0',
    brandSoft: '#1C332D',
    background: '#111614',
    surface: '#1A211E',
    border: '#2B3531',
    text: '#E8EEEB',
    textMuted: '#9AA8A2',
  },
};

/** Espaçamentos (px), numa escala de 4 em 4. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Arredondamento dos cantos (px). */
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
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
  bold: '700',
} as const;

/** Devolve a paleta do tema pedido; sem tema (ou desconhecido), usa o claro. */
export function getColors(scheme: string | null | undefined): ColorPalette {
  return scheme === 'dark' ? colors.dark : colors.light;
}
