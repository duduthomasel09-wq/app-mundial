import type { NextConfig } from 'next';

/**
 * Pacotes internos do monorepo usados pelo painel (etapa 5).
 * Eles são publicados como código-fonte TypeScript; esta lista faz o
 * Next.js compilá-los junto com o painel.
 */
const sharedPackages = ['@gfg/core', '@gfg/i18n', '@gfg/ui'];

/**
 * Páginas do login e da recuperação de senha (ADR 0017). O link do e-mail traz um token
 * na URL (`/auth/confirmar?token_hash=…`): estas páginas nunca enviam o endereço para
 * outros sites (`Referrer-Policy: no-referrer`) e nunca ficam em cache.
 */
const authPaths = ['/login', '/esqueci-senha', '/auth/confirmar', '/nova-senha'];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: sharedPackages,
  async headers() {
    return authPaths.map((source) => ({
      source,
      headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      ],
    }));
  },
  logging: {
    // Em `next dev`, o terminal mostra cada endereço acessado. O link do e-mail tem o
    // token na URL: nunca registrar.
    incomingRequests: { ignore: [/^\/auth\/confirmar/] },
  },
};

export default nextConfig;
