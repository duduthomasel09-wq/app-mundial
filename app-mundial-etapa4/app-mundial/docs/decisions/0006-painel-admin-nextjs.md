# ADR 0006 — Fundação do painel administrativo (Next.js)

- **Status:** Proposta (28/09/2026) — aguardando aprovação na etapa 4 da Fase 0

## Contexto

O painel (`apps/admin`) precisa existir antes do Supabase e dos cadastros, mas já preparado
para receber login, pacotes compartilhados e variáveis de ambiente sem retrabalho.

## Decisão

1. **Next.js 16 com App Router** (`src/app`) e **Turbopack** (padrão da versão 16).
2. **Mesma versão do React do app mobile (19.2.3)** — com `node-linker=hoisted` (ADR 0005),
   versões diferentes do React no monorepo causariam cópias duplicadas e erros.
3. **TypeScript ~6.0.3**, igual ao app mobile.
4. **ESLint 9** (não o 10): os plugins usados pelo `eslint-config-next` e pelo
   `eslint-config-expo` ainda não declaram suporte ao ESLint 10.
   O comando é `eslint .` — o `next lint` foi removido no Next.js 16.
5. **CSS Modules + variáveis CSS**, sem Tailwind ou biblioteca de componentes por enquanto.
   A escolha visual definitiva fica para a etapa 8 (Design system mínimo).
6. **Autenticação preparada, não implementada:**
   - `getAdminSession()` em `src/lib/auth` é o único ponto que decide se há login;
   - o layout do grupo `(painel)` exige sessão e manda para `/login` se não houver;
   - `ADMIN_AUTH_MODE=disabled` (padrão) usa uma sessão simulada de desenvolvimento;
     `supabase` fica reservado para o login real (hoje devolve "sem sessão").
   - As páginas que dependem da sessão são renderizadas a cada acesso (`force-dynamic`).
7. **Pacotes compartilhados:** `@gfg/core`, `@gfg/i18n` e `@gfg/ui` já estão em
   `transpilePackages`; a dependência `workspace:*` será adicionada na etapa 5, quando os
   pacotes ganharem `package.json`.
8. Nova configuração compartilhada `@gfg/config/typescript/nextjs.json`.
9. Ajuste no `turbo.json`: a tarefa `build` passa a considerar `NEXT_PUBLIC_*` e
   `ADMIN_AUTH_MODE`, para o cache não misturar builds de ambientes diferentes.

## Consequências

- O painel roda e compila sem nenhuma chave real.
- Trocar para login real exige mexer só em `src/lib/auth/session.ts` (e na tela de login).
- O modo `disabled` **nunca** deve ser usado em produção — a etapa 11 vai garantir isso.
