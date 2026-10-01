import { describe, expect, it } from 'vitest';

import {
  hasStaffRole,
  isPlanId,
  isStaffRole,
  isWithinLimit,
  planIncludes,
  ROLES,
  STAFF_ROLES,
  subscriptionGrantsAccess,
} from './plans';

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

  it('papéis: user é o padrão; só editor e admin são papéis elevados', () => {
    expect(ROLES).toEqual(['user', 'editor', 'admin']);
    expect(STAFF_ROLES).toEqual(['editor', 'admin']);
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('user')).toBe(false);
    expect(isStaffRole('superadmin')).toBe(false);
  });

  it('hierarquia igual à has_role() do banco: admin também vale como editor', () => {
    expect(hasStaffRole(['admin'], 'editor')).toBe(true);
    expect(hasStaffRole(['admin'], 'admin')).toBe(true);
    expect(hasStaffRole(['editor'], 'editor')).toBe(true);
    expect(hasStaffRole(['editor'], 'admin')).toBe(false);
    expect(hasStaffRole([], 'editor')).toBe(false);
    expect(hasStaffRole(['editor', 'admin'], 'admin')).toBe(true);
  });
});
