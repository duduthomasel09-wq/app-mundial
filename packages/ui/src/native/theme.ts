import { useColorScheme } from 'react-native';

import { getColors, type ColorPalette, type ColorScheme } from '../tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ColorPalette;
}

/** Tema atual (claro ou escuro), seguindo a configuração do aparelho. */
export function useTheme(): Theme {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: getColors(scheme) };
}
