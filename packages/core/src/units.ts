/**
 * Conversão de unidades de cozinha.
 *
 * As medidas de volume "cup", "tbsp", "tsp" e "fl_oz" seguem o padrão **americano**,
 * que é o usado nas receitas dos EUA. Ao mostrar para o usuário, sempre arredonde
 * (ex.: `roundTo(valor, 1)`) — os fatores são exatos, mas a cozinha não é.
 */

export const MASS_UNITS = ['g', 'kg', 'oz', 'lb'] as const;
export const VOLUME_UNITS = ['ml', 'l', 'tsp', 'tbsp', 'cup', 'fl_oz'] as const;

export type MassUnit = (typeof MASS_UNITS)[number];
export type VolumeUnit = (typeof VOLUME_UNITS)[number];
export type Unit = MassUnit | VolumeUnit;
export type TemperatureUnit = 'c' | 'f';

/** Quantos gramas há em 1 unidade. */
const GRAMS_PER_UNIT: Readonly<Record<MassUnit, number>> = {
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

/** Quantos mililitros há em 1 unidade. */
const MILLILITERS_PER_UNIT: Readonly<Record<VolumeUnit, number>> = {
  ml: 1,
  l: 1000,
  tsp: 4.92892159375,
  tbsp: 14.78676478125,
  cup: 236.5882365,
  fl_oz: 29.5735295625,
};

export function isMassUnit(unit: string): unit is MassUnit {
  return (MASS_UNITS as readonly string[]).includes(unit);
}

export function isVolumeUnit(unit: string): unit is VolumeUnit {
  return (VOLUME_UNITS as readonly string[]).includes(unit);
}

/**
 * Converte um valor entre unidades do mesmo tipo (peso↔peso ou volume↔volume).
 * Peso↔volume depende do ingrediente (densidade) e por isso gera erro.
 */
export function convertUnit(value: number, from: Unit, to: Unit): number {
  if (isMassUnit(from) && isMassUnit(to)) {
    return (value * GRAMS_PER_UNIT[from]) / GRAMS_PER_UNIT[to];
  }
  if (isVolumeUnit(from) && isVolumeUnit(to)) {
    return (value * MILLILITERS_PER_UNIT[from]) / MILLILITERS_PER_UNIT[to];
  }
  throw new Error(`Não é possível converter "${from}" em "${to}": são tipos de medida diferentes.`);
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit) {
  if (from === to) return value;
  return from === 'c' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
}

/** Arredonda para um número de casas decimais (padrão: 0). */
export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
