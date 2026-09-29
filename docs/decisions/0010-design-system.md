# ADR 0010 — Design system mínimo: tokens compartilhados e componentes por plataforma

- **Status:** Aprovada (29/09/2026) — etapa 8 da Fase 0
- **Complementa:** ADR 0007 (pacotes compartilhados) — não a substitui

## Contexto

A ADR 0007 definiu `@gfg/ui` como "TypeScript puro, sem React" e deixou os componentes para
a etapa 8. O app (React Native: `View`, `Text`, `Pressable`) e o painel (web: HTML e CSS)
desenham componentes de formas diferentes, então um único componente não serve aos dois
sem adicionar bibliotecas de compatibilidade (ex.: `react-native-web` no painel).

## Decisão

1. **`@gfg/ui` (entrada principal) continua TypeScript puro, sem React** — mantém a ADR 0007.
   Contém os **tokens** (cores claro/escuro, tipografia, espaçamentos, raios, tamanhos),
   funções puras de variantes (ex.: cores de um botão por variante e estado), verificação de
   contraste e a geração das variáveis CSS usadas pelo painel.
2. **`@gfg/ui/native`** (subcaminho do mesmo pacote): componentes React Native do app —
   `Text`, `Button`, `Card`, `Input`, `Badge`, `Divider` e o hook `useTheme()`.
   `react` e `react-native` são declarados como `peerDependencies` (fornecidos pelo app);
   nenhuma dependência nova é instalada.
3. **`apps/admin/src/components/ui`**: componentes web do painel com os mesmos nomes e
   variantes, feitos com CSS Modules. As cores e medidas vêm dos tokens de `@gfg/ui`, por
   meio de variáveis CSS (`--color-*`, `--space-*`, `--radius-*`, `--font-size-*`) geradas
   por `createCssVariables()` e injetadas no layout raiz.
4. **Não existe `@gfg/ui/web` neste momento.** Só há um app web (o painel); se surgir outro,
   os componentes web podem ser movidos para o pacote numa nova ADR.
5. **Uma única fonte de verdade:** nenhum valor de cor, espaçamento, fonte ou raio fica fixo
   em telas ou CSS — sempre um token (exceções só para medidas de layout específicas, como a
   largura do menu lateral, declaradas uma vez).
6. **Tema:** claro/escuro segue o sistema (`useColorScheme()` no app; `prefers-color-scheme`
   no painel). Escolha manual de tema fica para quando existir perfil de usuário.
7. **Acessibilidade:** um teste garante contraste mínimo de 4,5:1 (WCAG AA) entre texto e
   fundo para os pares de cores usados; botões e campos têm altura mínima de 44 px.

## Consequências

- O app e o painel ficam visualmente consistentes, mudando um token em um só lugar.
- Cada componente existe duas vezes (native e web), com a mesma API sempre que possível;
  mudanças de variante devem ser feitas nos dois (as regras de cor ficam em funções puras
  compartilhadas para reduzir diferenças).
- O painel não usa React Native nem `react-native-web`.
