import { describe, expect, it } from 'vitest';

import { colors } from './tokens';
import { badgeColors, buttonColors, inputColors, textColor } from './variants';

const p = colors.light;

describe('variantes', () => {
  it('texto: cada tom usa a cor certa', () => {
    expect(textColor(p)).toBe(p.text);
    expect(textColor(p, 'muted')).toBe(p.textMuted);
    expect(textColor(p, 'danger')).toBe(p.danger);
  });

  it('botão principal escurece ao ser pressionado', () => {
    expect(buttonColors(p).background).toBe(p.brand);
    expect(buttonColors(p, 'primary', { pressed: true }).background).toBe(p.brandStrong);
    expect(buttonColors(p, 'ghost').background).toBe('transparent');
    expect(buttonColors(p, 'danger').background).toBe(p.danger);
  });

  it('campo: borda vermelha com erro, cor da marca com foco', () => {
    expect(inputColors(p).border).toBe(p.border);
    expect(inputColors(p, { focused: true }).border).toBe(p.brand);
    expect(inputColors(p, { error: true, focused: true }).border).toBe(p.danger);
  });

  it('selo neutro usa texto secundário', () => {
    expect(badgeColors(p).text).toBe(p.textMuted);
    expect(badgeColors(p, 'success').background).toBe(p.successSoft);
  });
});
