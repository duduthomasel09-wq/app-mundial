# apps/mobile — `@gfg/mobile`

App Expo (iOS/Android) do Global Food Guide.

- **Stack:** Expo SDK 57 · React Native 0.86 · Expo Router · TypeScript
- **Rotas:** ficam em `src/app/` (cada arquivo vira uma tela)
- **Textos:** vêm de `@gfg/i18n` (`useTranslation()`) — pt-BR, en ou es. Idioma: o do perfil (com
  conta) > o escolhido no onboarding (no aparelho) > o do celular (`src/lib/i18n.ts`)
- **Variáveis de ambiente:** lidas e validadas em `src/lib/env.ts` (modelo: `.env.example`,
  lista completa em `docs/ENVIRONMENT.md`)
- **Visual:** componentes de `@gfg/ui/native`; em modo de desenvolvimento, a rota
  `/design-system` mostra o catálogo de componentes (na versão publicada ela volta ao início)

## Conta e onboarding (ADR 0018)

| Rota               | Tela                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| `/idioma`          | Onboarding 1/3 — idioma (primeiro acesso, para todos)                    |
| `/pais`            | Onboarding 2/3 — país (preenche moeda e unidades)                        |
| `/moeda-unidades`  | Onboarding 3/3 — moeda e unidades → salva no aparelho (e no perfil)      |
| `/`                | Início: preferências, "Alterar preferências", entrar/criar conta ou sair |
| `/entrar`          | Entrar com e-mail e senha (só sem conta)                                 |
| `/criar-conta`     | Criar conta com e-mail e senha (só sem conta)                            |
| `/confirmar-email` | Código de 6 dígitos enviado por e-mail (só sem conta)                    |

- **Conta opcional:** sem conta, as preferências ficam no aparelho; com conta, no perfil do
  Supabase. Quem entra com perfil incompleto passa pelo onboarding antes do início.
- **Sessão no celular:** criptografada (AES-GCM do `expo-crypto`), com a chave no SecureStore e
  o conteúdo no AsyncStorage (`src/lib/storage/session-storage.ts`). Na web: `localStorage`.
- **Regras** (validação, código, erros, para onde ir) ficam em `@gfg/core`, com testes; o estado
  de conta e perfil fica em `src/lib/auth/AppSessionProvider.tsx`.
- Só a chave **pública** do Supabase; nada de senha, token ou código em log.
- Ainda não existem: Google/Apple, "esqueci minha senha" no app, paywall e abas.

## Rodar

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter @gfg/mobile dev
```

Escaneie o QR code com o app **Expo Go** no celular. Para usar conta, crie `.env.local` a partir
de `.env.example` com a URL e a chave **pública** do projeto de desenvolvimento
(`docs/SUPABASE.md`, seção 5.5). Sem ele, o app funciona sem conta.

Outros comandos: `pnpm --filter @gfg/mobile typecheck` · `pnpm --filter @gfg/mobile doctor`
