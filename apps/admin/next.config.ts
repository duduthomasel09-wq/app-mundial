import type { NextConfig } from 'next';

/**
 * Pacotes internos do monorepo usados pelo painel (etapa 5).
 * Eles são publicados como código-fonte TypeScript; esta lista faz o
 * Next.js compilá-los junto com o painel.
 */
const sharedPackages = ['@gfg/core', '@gfg/i18n', '@gfg/ui'];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: sharedPackages,
};

export default nextConfig;
