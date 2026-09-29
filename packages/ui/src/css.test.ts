import { describe, expect, it } from 'vitest';

import { colorVariables, createCssVariables, staticVariables } from './css';
import { colors } from './tokens';

describe('variáveis CSS', () => {
  it('gera as cores de cada tema em kebab-case', () => {
    expect(colorVariables('light')['--color-text-muted']).toBe(colors.light.textMuted);
    expect(colorVariables('dark')['--color-brand']).toBe(colors.dark.brand);
  });

  it('gera medidas em px', () => {
    const vars = staticVariables();
    expect(vars['--space-md']).toBe('12px');
    expect(vars['--radius-card']).toBe('14px');
    expect(vars['--radius-full']).toBe('9999px');
    expect(vars['--text-title-size']).toBe('28px');
    expect(vars['--font-weight-bold']).toBe('700');
    expect(vars['--size-control-height']).toBe('44px');
  });

  it('folha completa tem tema claro e escuro', () => {
    const css = createCssVariables();
    expect(css).toContain(':root{');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(`--color-background:${colors.dark.background};`);
    expect(css).not.toMatch(/[<>]/);
  });
});
