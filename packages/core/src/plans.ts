/**
 * Planos, assinaturas e papéis (PROJECT_SPEC, seções 2.1, 2.2 e 6).
 *
 * Importante: os **limites** de cada plano (ex.: quantas listas de compras) NÃO ficam
 * aqui — eles vêm da tabela `Entitlement`, para poderem mudar pelo painel sem nova versão.
 * Este arquivo só tem os tipos e as regras que nunca mudam.
 */

export const PLAN_IDS = ['free', 'plus', 'pro'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/** Dias de teste grátis de PLUS ou PRO (uma vez por conta). */
export const TRIAL_DAYS = 7;

export const SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'expired',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Todos os papéis do PROJECT_SPEC. `user` é o padrão (sem linha em `user_roles`). */
export const ROLES = ['user', 'editor', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Papéis elevados — os únicos gravados em `user_roles` (tipo `app_role` no banco, ADR 0015).
 * `admin` inclui todas as permissões de `editor`.
 */
export const STAFF_ROLES = ['editor', 'admin'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && (STAFF_ROLES as readonly string[]).includes(value);
}

/**
 * Mesma regra de `public.has_role()` no banco: `true` se os papéis do usuário atendem ao
 * papel exigido (admin também vale como editor). Serve para a interface; quem garante a
 * segurança de verdade é a RLS no banco.
 */
export function hasStaffRole(roles: readonly StaffRole[], required: StaffRole): boolean {
  return roles.includes(required) || (required === 'editor' && roles.includes('admin'));
}

/** Limite de um recurso: um número máximo, ou `null` para ilimitado. */
export type EntitlementLimit = number | null;

export interface Entitlement {
  planId: PlanId;
  /** Ex.: `shopping_lists.max`, `equivalents.daily`. */
  featureKey: string;
  limit: EntitlementLimit;
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value);
}

/** `true` se o plano atual inclui tudo do plano exigido (free < plus < pro). */
export function planIncludes(current: PlanId, required: PlanId): boolean {
  return PLAN_IDS.indexOf(current) >= PLAN_IDS.indexOf(required);
}

/**
 * Status que dão acesso ao plano pago. `past_due` (pagamento atrasado) ainda dá acesso:
 * as lojas tentam cobrar de novo por alguns dias antes de cancelar.
 */
export function subscriptionGrantsAccess(status: SubscriptionStatus): boolean {
  return status === 'trialing' || status === 'active' || status === 'past_due';
}

/** `true` se ainda cabe mais um item dentro do limite. */
export function isWithinLimit(used: number, limit: EntitlementLimit): boolean {
  return limit === null || used < limit;
}
