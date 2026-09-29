import type { ColorPalette } from './tokens';

/**
 * Regras de cor dos componentes, compartilhadas pelo app e pelo painel (ADR 0010).
 * Funções puras: recebem a paleta e devolvem as cores a usar.
 */

export const TEXT_TONES = ['default', 'muted', 'brand', 'success', 'warning', 'danger'] as const;
export type TextTone = (typeof TEXT_TONES)[number];

export function textColor(palette: ColorPalette, tone: TextTone = 'default'): string {
  switch (tone) {
    case 'muted':
      return palette.textMuted;
    case 'brand':
      return palette.brand;
    case 'success':
      return palette.success;
    case 'warning':
      return palette.warning;
    case 'danger':
      return palette.danger;
    default:
      return palette.text;
  }
}

export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export interface ControlColors {
  background: string;
  text: string;
  border: string;
}

export interface ButtonState {
  pressed?: boolean;
}

export function buttonColors(
  palette: ColorPalette,
  variant: ButtonVariant = 'primary',
  state: ButtonState = {},
): ControlColors {
  switch (variant) {
    case 'secondary':
      return {
        background: state.pressed ? palette.brandSoft : palette.surface,
        text: palette.brand,
        border: palette.border,
      };
    case 'ghost':
      return {
        background: state.pressed ? palette.brandSoft : 'transparent',
        text: palette.brand,
        border: 'transparent',
      };
    case 'danger':
      return { background: palette.danger, text: palette.onBrand, border: palette.danger };
    default: {
      const background = state.pressed ? palette.brandStrong : palette.brand;
      return { background, text: palette.onBrand, border: background };
    }
  }
}

/** Opacidade de componentes desativados. */
export const DISABLED_OPACITY = 0.5;

export const BADGE_TONES = ['neutral', 'brand', 'success', 'warning', 'danger'] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

export function badgeColors(
  palette: ColorPalette,
  tone: BadgeTone = 'neutral',
): Omit<ControlColors, 'border'> {
  switch (tone) {
    case 'brand':
      return { background: palette.brandSoft, text: palette.brand };
    case 'success':
      return { background: palette.successSoft, text: palette.success };
    case 'warning':
      return { background: palette.warningSoft, text: palette.warning };
    case 'danger':
      return { background: palette.dangerSoft, text: palette.danger };
    default:
      return { background: palette.background, text: palette.textMuted };
  }
}

export interface InputState {
  error?: boolean;
  focused?: boolean;
}

export function inputColors(palette: ColorPalette, state: InputState = {}): ControlColors {
  return {
    background: palette.surface,
    text: palette.text,
    border: state.error ? palette.danger : state.focused ? palette.brand : palette.border,
  };
}
