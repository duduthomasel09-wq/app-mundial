# apps/mobile — `@gfg/mobile`

App Expo (iOS/Android) do Global Food Guide.

- **Stack:** Expo SDK 57 · React Native 0.86 · Expo Router · TypeScript
- **Rotas:** ficam em `src/app/` (cada arquivo vira uma tela)
- **Textos:** vêm de `@gfg/i18n` (`useTranslation()`); o idioma segue o do celular
  (`src/lib/i18n.ts`) — pt-BR, en ou es, com inglês quando o idioma não é suportado
- **Visual:** componentes de `@gfg/ui/native`; em modo de desenvolvimento, a rota
  `/design-system` mostra o catálogo de componentes (na versão publicada ela volta ao início)

## Rodar

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter @gfg/mobile dev
```

Escaneie o QR code com o app **Expo Go** no celular.

Outros comandos: `pnpm --filter @gfg/mobile typecheck` · `pnpm --filter @gfg/mobile doctor`
