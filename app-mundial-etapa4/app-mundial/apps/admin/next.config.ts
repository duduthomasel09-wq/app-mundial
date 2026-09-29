import type { NextConfig } from 'next';

/**
 * Pacotes internos do monorepo que o painel poderá importar no futuro.
 * Eles serão criados na etapa 5 (Pacotes compartilhados); aqui já ficam
 * listados para o Next.js compilá-los direto do código-fonte TypeScript.
 */
const sharedPackages = ['@gfg/core', '@gfg/i18n', '@gfg/ui'];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: sharedPackages,
};

export default nextConfig;
