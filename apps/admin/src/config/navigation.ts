/**
 * Itens do menu lateral do painel.
 *
 * Só o Dashboard existe nesta etapa. As demais áreas aparecem como
 * "Em breve" e ganham rota própria quando forem implementadas.
 * O nome de cada item vem das traduções: `admin.nav.<key>`.
 */

export type NavKey =
  | 'dashboard'
  | 'produtos'
  | 'ingredientes'
  | 'equivalencias'
  | 'receitas'
  | 'traducoes'
  | 'usuarios'
  | 'assinaturas'
  | 'configuracoes';

export interface NavItem {
  key: NavKey;
  href: string;
  available: boolean;
}

export const navigation: readonly NavItem[] = [
  { key: 'dashboard', href: '/dashboard', available: true },
  { key: 'produtos', href: '/produtos', available: false },
  { key: 'ingredientes', href: '/ingredientes', available: false },
  { key: 'equivalencias', href: '/equivalencias', available: false },
  { key: 'receitas', href: '/receitas', available: false },
  { key: 'traducoes', href: '/traducoes', available: false },
  { key: 'usuarios', href: '/usuarios', available: false },
  { key: 'assinaturas', href: '/assinaturas', available: false },
  { key: 'configuracoes', href: '/configuracoes', available: false },
];
