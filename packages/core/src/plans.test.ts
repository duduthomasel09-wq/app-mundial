import { describe, expect, it } from 'vitest';

import { isPlanId, isWithinLimit, planIncludes, subscriptionGrantsAccess } from './plans';

describe('planos', () => {
  it('compara planos na ordem free < plus < pro', () => {
    expect(planIncludes('pro', 'plus')).toBe(true);
    expect(planIncludes('plus', 'plus')).toBe(true);
    expect(planIncludes('free', 'plus')).toBe(false);
    expect(planIncludes('plus', 'pro')).toBe(false);
  });

  it('só dá acesso com assinatura válida', () => {
    expect(subscriptionGrantsAccess('trialing')).toBe(true);
    expect(subscriptionGrantsAccess('active')).toBe(true);
    expect(subscriptionGrantsAccess('past_due')).toBe(true);
    expect(subscriptionGrantsAccess('canceled')).toBe(false);
    expect(subscriptionGrantsAccess('expired')).toBe(false);
  });

  it('respeita limites (null = ilimitado)', () => {
    expect(isWithinLimit(0, 1)).toBe(true);
    expect(isWithinLimit(1, 1)).toBe(false);
    expect(isWithinLimit(9999, null)).toBe(true);
  });

  it('valida ids de plano', () => {
    expect(isPlanId('plus')).toBe(true);
    expect(isPlanId('premium')).toBe(false);
  });
});
