/**
 * Itens do menu lateral do painel.
 *
 * Só o Dashboard existe nesta etapa. As demais áreas aparecem como
 * "Em breve" e ganham rota própria quando forem implementadas.
 */

export interface NavItem {
  key: string;
  label: string;
  href: string;
  available: boolean;
}

export const navigation: readonly NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', available: true },
  { key: 'produtos', label: 'Produtos', href: '/produtos', available: false },
  { key: 'ingredientes', label: 'Ingredientes', href: '/ingredientes', available: false },
  { key: 'equivalencias', label: 'Equivalências', href: '/equivalencias', available: false },
  { key: 'receitas', label: 'Receitas', href: '/receitas', available: false },
  { key: 'traducoes', label: 'Traduções', href: '/traducoes', available: false },
  { key: 'usuarios', label: 'Usuários', href: '/usuarios', available: false },
  { key: 'assinaturas', label: 'Assinaturas', href: '/assinaturas', available: false },
  { key: 'configuracoes', label: 'Configurações', href: '/configuracoes', available: false },
];
