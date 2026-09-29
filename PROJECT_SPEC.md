# PROJECT_SPEC — Global Food Guide (nome provisório)

> Versão 0.3 · 28/09/2026 · Status: **base técnica aprovada** · Fase 0 em andamento
> Nenhum código de funcionalidade deve ser escrito antes da aprovação deste documento.

---

## 0. Estado atual do projeto

| Item          | Situação                                                     |
| ------------- | ------------------------------------------------------------ |
| Repositório   | `github.com/duduthomasel09-wq/app-mundial` (público)         |
| Conteúdo      | `README.md` + `index.html` (página estática de apresentação) |
| Hospedagem    | GitHub Pages (`duduthomasel09-wq.github.io/app-mundial`)     |
| Código de app | Nenhum — projeto começa do zero                              |

A página atual serve apenas como vitrine. A nova arquitetura substitui isso por um monorepo (seção 4); a página de apresentação pode continuar existindo como landing page.

---

## 1. Análise dos requisitos

### 1.1 Visão

Um guia alimentar **internacional** que funcione para qualquer pessoa, em qualquer país: receitas, produtos de supermercado, equivalências entre países, substituições, tradução de nomes, listas de compras, guia de chás, recursos de viagem e, no futuro, recomendações com IA.

### 1.2 Requisitos funcionais (RF)

| ID   | Requisito                                  | Observação                                                             |
| ---- | ------------------------------------------ | ---------------------------------------------------------------------- |
| RF01 | Buscar e ver receitas                      | Filtros por país, ingrediente, tempo, dieta                            |
| RF02 | Descobrir produtos de supermercado         | Por país e categoria                                                   |
| RF03 | Produtos equivalentes em outros países     | Núcleo diferencial do app                                              |
| RF04 | Substitutos de ingredientes                | Com proporção e contexto (ex.: "para bolos")                           |
| RF05 | Tradução de nomes de produtos/ingredientes | Glossário curado + fallback automático                                 |
| RF06 | Listas de compras                          | Gerar a partir de receitas, adaptar ao país                            |
| RF07 | Guia de chás                               | Tipos, preparo, origem                                                 |
| RF08 | Recursos de viagem                         | "Estou no país X": pratos típicos, produtos equivalentes, frases úteis |
| RF09 | Recomendações com IA                       | **Futuro** (pós-MVP)                                                   |
| RF10 | Contas de usuário e autenticação           | E-mail, Google, Apple                                                  |
| RF11 | Planos FREE / PLUS / PRO                   | Com período de teste                                                   |
| RF12 | Paywall e controle de acesso por plano     | Aplicado no app **e** no servidor                                      |
| RF13 | Painel administrativo                      | Conteúdo, usuários, assinaturas, traduções                             |
| RF14 | Favoritos                                  | Receitas, produtos, chás                                               |

### 1.3 Requisitos não funcionais (RNF)

| ID    | Requisito                  | Meta                                                              |
| ----- | -------------------------- | ----------------------------------------------------------------- |
| RNF01 | Internacionalização (i18n) | Textos da interface **e** do conteúdo traduzíveis                 |
| RNF02 | Multi-país e multi-moeda   | Preços locais, unidades (g/oz, ml/cup), formato de data/número    |
| RNF03 | Segurança                  | Autenticação segura, permissões no banco, segredos fora do código |
| RNF04 | Privacidade                | LGPD (BR), GDPR (UE), CCPA (EUA); exclusão e exportação de dados  |
| RNF05 | Analytics                  | Eventos de uso, funil de conversão, retenção                      |
| RNF06 | Desempenho                 | Busca < 500 ms; app utilizável com internet fraca                 |
| RNF07 | Mobile-first               | iOS, Android e Web a partir de uma base de código                 |
| RNF08 | Escalabilidade de conteúdo | Milhares de produtos × dezenas de países                          |
| RNF09 | Acessibilidade             | Contraste, tamanhos de fonte, leitores de tela                    |

### 1.4 Riscos principais

1. **Dados de produtos** — de onde virão os produtos de supermercado de cada país (ver D05). É o maior risco do projeto.
2. **Qualidade das equivalências** — equivalência errada destrói a confiança do usuário; exige curadoria.
3. **Regras das lojas de apps** — assinaturas dentro de apps iOS/Android precisam usar o sistema de pagamento das lojas.
4. **Escopo** — muitas funcionalidades; MVP precisa ser pequeno.

---

## 2. Entidades principais

### 2.1 Usuários e acesso

| Entidade    | Campos principais                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **User**    | id, email, auth_provider, created_at, deleted_at                                                        |
| **Profile** | user_id, display_name, locale (idioma), country_code, currency_code, unit_system, dietary_preferences[] |
| **Role**    | user_id, role (`user`, `editor`, `admin`)                                                               |
| **Consent** | user_id, type (analytics, marketing), granted, updated_at                                               |

### 2.2 Planos e assinaturas

| Entidade         | Campos principais                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Plan**         | id (`free`, `plus`, `pro`), name, is_active                                                                                                |
| **Price**        | plan_id, currency_code, amount, interval (mês/ano), store (apple/google/stripe), external_id                                               |
| **Entitlement**  | plan_id, feature_key, limit (ex.: `shopping_lists.max = 3`)                                                                                |
| **Subscription** | user_id, plan_id, status (`trialing`, `active`, `past_due`, `canceled`, `expired`), trial_ends_at, current_period_end, source, external_id |

### 2.3 Geografia e idioma

| Entidade     | Campos principais                                              |
| ------------ | -------------------------------------------------------------- |
| **Country**  | code (ISO 3166), default_locale, default_currency, unit_system |
| **Currency** | code (ISO 4217), symbol, decimals                              |
| **Locale**   | code (BCP 47, ex.: `pt-BR`), name, is_enabled                  |

### 2.4 Alimentos e conteúdo

| Entidade                  | Campos principais                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Ingredient**            | id, slug, category, is_allergen, allergens[]                                              |
| **IngredientTranslation** | ingredient_id, locale, name, aliases[]                                                    |
| **Product**               | id, barcode (GTIN/EAN), brand_id, ingredient_id?, category, image                         |
| **ProductTranslation**    | product_id, locale, name, description                                                     |
| **Brand**                 | id, name, country_code                                                                    |
| **ProductAvailability**   | product_id, country_code, typical_price, currency_code, stores[]                          |
| **ProductEquivalence**    | product_a_id, product_b_id / ingredient_id, country_code, score (0–1), notes, verified_by |
| **Substitution**          | ingredient_id, substitute_id, ratio, context (ex.: "confeitaria"), dietary_tags[]         |
| **Recipe**                | id, origin_country, time_minutes, servings, difficulty, image, is_premium                 |
| **RecipeTranslation**     | recipe_id, locale, title, steps[]                                                         |
| **RecipeIngredient**      | recipe_id, ingredient_id, quantity, unit                                                  |
| **Tea**                   | id, type, origin_country, caffeine_level, brew_temp_c, brew_time_s                        |
| **TeaTranslation**        | tea_id, locale, name, description, benefits                                               |
| **CountryGuide** (viagem) | country_code, typical_dishes[], essential_products[], phrases[]                           |

### 2.5 Dados do usuário

| Entidade             | Campos principais                                                          |
| -------------------- | -------------------------------------------------------------------------- |
| **ShoppingList**     | id, user_id, name, country_code, created_at                                |
| **ShoppingListItem** | list_id, ingredient_id / product_id / texto livre, quantity, unit, checked |
| **Favorite**         | user_id, target_type, target_id                                            |

### 2.6 Administração

| Entidade        | Campos principais                           |
| --------------- | ------------------------------------------- |
| **AuditLog**    | actor_id, action, target, before, after, at |
| **FeatureFlag** | key, enabled, rollout_percent, plans[]      |

> Padrão de tradução: cada conteúdo tem uma tabela `*Translation` por idioma. Se faltar tradução, usar o idioma de fallback (inglês) e marcar para tradução no painel admin.

---

## 3. Arquitetura proposta

```
┌─────────────────────────┐   ┌─────────────────────────┐
│  App mobile (iOS/Android)│   │   Painel Admin (Web)    │
│  + Web — Expo/React Native│   │   Next.js               │
└────────────┬────────────┘   └────────────┬────────────┘
             │  HTTPS (SDK Supabase + API)  │
             ▼                              ▼
┌──────────────────────────────────────────────────────┐
│                     SUPABASE                          │
│  Auth (e-mail, Google, Apple)                         │
│  Postgres + Row Level Security (acesso por plano)     │
│  Storage (imagens)                                    │
│  Edge Functions (webhooks de pagamento, lógica)       │
│  Busca: Postgres full-text + pg_trgm                  │
└───────────┬───────────────────────┬──────────────────┘
            │                       │
     ┌──────▼──────┐        ┌───────▼────────┐
     │ RevenueCat  │        │ PostHog        │
     │ (assinaturas│        │ (analytics +   │
     │ Apple/Google│        │ feature flags) │
     │ /Stripe web)│        └────────────────┘
     └─────────────┘
           + Sentry (erros) · futuro: API de IA (recomendações)
```

### 3.1 Escolhas e por quê

| Camada      | Proposta                              | Motivo                                                                                              |
| ----------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Linguagem   | **TypeScript** em tudo                | Um só idioma de programação no app, admin e servidor                                                |
| App         | **Expo (React Native)** + Expo Router | Um código para iOS, Android e Web; publicação nas lojas facilitada                                  |
| Admin       | **Next.js**                           | Painel web rápido de construir, reaproveita tipos e componentes                                     |
| Backend     | **Supabase**                          | Banco Postgres, autenticação, armazenamento e funções em um só serviço; plano gratuito para começar |
| Permissões  | **Row Level Security** no Postgres    | Controle de acesso por plano aplicado no banco, não só na tela                                      |
| Assinaturas | **RevenueCat**                        | Unifica Apple, Google e Stripe; controla trial e status; envia webhooks                             |
| i18n        | **i18next** + formatos `Intl`         | Padrão de mercado; plurais, moedas, datas por país                                                  |
| Analytics   | **PostHog**                           | Eventos, funis, feature flags; tem opção de hospedagem na UE (GDPR)                                 |
| Erros       | **Sentry**                            | Monitoramento de falhas no app e no servidor                                                        |
| Monorepo    | **pnpm + Turborepo**                  | App, admin e pacotes compartilhados no mesmo repositório                                            |

### 3.2 Controle de acesso por plano (como funciona)

1. RevenueCat informa o status da assinatura → webhook → Edge Function atualiza a tabela `Subscription`.
2. Uma função no banco (`current_plan(user_id)`) devolve `free`, `plus` ou `pro`.
3. Regras RLS e a tabela `Entitlement` decidem o que cada plano vê e quantos itens pode criar.
4. O app só **exibe** o paywall; quem **bloqueia** de verdade é o servidor.

### 3.3 Internacionalização (três níveis)

1. **Interface** — arquivos de tradução (`packages/i18n/locales/pt-BR.json`, `en.json`…).
2. **Conteúdo** — tabelas `*Translation` no banco, editáveis no admin.
3. **Formatos** — moeda, número, data e unidades via `Intl` + perfil do usuário (país/moeda/unidade).

### 3.4 Segurança e privacidade

- Chaves e segredos apenas em variáveis de ambiente (nunca no repositório).
- RLS ativado em **todas** as tabelas; admin usa papel `admin` verificado no servidor.
- Consentimento de analytics antes de rastrear (obrigatório na UE).
- Exclusão de conta e exportação de dados pelo próprio usuário.
- AuditLog para toda alteração feita no painel admin.
- Política de privacidade e termos de uso em todos os idiomas suportados.

---

## 4. Estrutura de pastas

```
app-mundial/
├── apps/
│   ├── mobile/              # Expo (iOS, Android, Web)
│   │   ├── app/             # telas (Expo Router)
│   │   │   ├── (auth)/      # login, cadastro
│   │   │   ├── (tabs)/      # início, receitas, produtos, listas, perfil
│   │   │   └── paywall.tsx
│   │   ├── components/
│   │   ├── features/        # recipes, products, equivalents, lists, teas, travel
│   │   └── lib/             # supabase, revenuecat, analytics
│   └── admin/               # Next.js — painel administrativo
│       ├── app/             # conteúdo, usuários, assinaturas, traduções
│       └── lib/
├── packages/
│   ├── core/                # tipos, regras de plano, conversão de unidades
│   ├── i18n/                # configuração i18next + arquivos de tradução
│   │   └── locales/         # pt-BR.json, en.json, es.json…
│   ├── ui/                  # componentes visuais compartilhados
│   └── config/              # eslint, tsconfig, prettier
├── supabase/
│   ├── migrations/          # criação das tabelas (SQL versionado)
│   ├── seed/                # dados iniciais (países, moedas, exemplos)
│   └── functions/           # Edge Functions (webhooks, etc.)
├── docs/
│   └── decisions/           # registro de decisões técnicas (ADRs)
├── site/                    # landing page atual (index.html)
├── PROJECT_SPEC.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 5. MVP (primeira versão utilizável)

**Objetivo do MVP:** provar o diferencial — _"estou em outro país, o que compro aqui no lugar do produto que eu conheço?"_ — com contas, planos e paywall funcionando.

### Dentro do MVP

- Cadastro/login (e-mail + Google + Apple).
- Escolha de idioma, país e moeda no primeiro acesso.
- **3 idiomas:** português (BR), inglês, espanhol.
- **5 países iniciais** (sugestão: Brasil, EUA, Portugal, Espanha, Reino Unido).
- Busca de ingredientes/produtos com tradução do nome.
- **Equivalentes em outro país** (conteúdo curado, ~200 itens iniciais).
- **Substitutos de ingredientes** (~100 itens).
- Receitas (~50, com ingredientes ligados à base).
- Lista de compras (criar, marcar, gerar a partir de receita).
- Planos FREE / PLUS / PRO, trial de 7 dias, paywall.
- Painel admin básico: CRUD de ingredientes, produtos, equivalências, receitas e traduções.
- Analytics de eventos-chave e monitoramento de erros.
- Política de privacidade, termos e exclusão de conta.

### Fora do MVP

- Guia de chás e recursos de viagem completos (entram na fase 3).
- Leitura de código de barras.
- Preços em tempo real de supermercados.
- Recomendações com IA.
- Modo offline completo.

---

## 6. Funcionalidades por plano

| Funcionalidade                    |         FREE          |         PLUS          |            PRO            |
| --------------------------------- | :-------------------: | :-------------------: | :-----------------------: |
| Buscar receitas                   | ✅ (receitas básicas) |       ✅ todas        |         ✅ todas          |
| Buscar produtos e ingredientes    |          ✅           |          ✅           |            ✅             |
| Tradução de nomes                 |          ✅           |          ✅           |            ✅             |
| Equivalentes em outros países     |    5 consultas/dia    |     ✅ ilimitado      |       ✅ ilimitado        |
| Substitutos de ingredientes       |      ✅ básicos       | ✅ todos + proporções |   ✅ todos + proporções   |
| Listas de compras                 |        1 lista        |      ilimitadas       | ilimitadas + compartilhar |
| Favoritos                         |        até 10         |      ilimitados       |        ilimitados         |
| Guia de chás                      |        amostra        |      ✅ completo      |        ✅ completo        |
| Recursos de viagem                |           —           |          ✅           |    ✅ + guias offline     |
| Conversão de unidades e moedas    |          ✅           |          ✅           |            ✅             |
| Sem anúncios                      |           —           |          ✅           |            ✅             |
| Leitor de código de barras        |           —           |           —           |        ✅ (fase 4)        |
| Planejamento semanal de refeições |           —           |           —           |        ✅ (fase 4)        |
| Recomendações com IA              |           —           |           —           |        ✅ (fase 5)        |
| Múltiplos perfis / família        |           —           |           —           |        ✅ (fase 4)        |

**Período de teste:** 7 dias de PLUS ou PRO, uma vez por conta.
**Preços:** a definir por país (ver D08); exibição sempre na moeda local.

> Todos os limites ficam na tabela `Entitlement`, e não fixos no código, para que possam ser ajustados pelo painel admin sem publicar nova versão.

---

## 7. Roadmap

| Fase     | Nome               | Entregas principais                                                                                           |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **0**    | Fundação           | Monorepo, Supabase, CI (GitHub Actions), i18n base, design system mínimo, ambientes dev/prod                  |
| **1**    | Núcleo             | Auth, perfil (idioma/país/moeda), tabelas de conteúdo, busca, equivalentes, substitutos, receitas, admin CRUD |
| **2**    | Monetização        | Planos, RevenueCat, trial, paywall, entitlements, analytics de conversão, páginas legais                      |
| **3**    | Conteúdo ampliado  | Listas de compras completas, guia de chás, recursos de viagem, mais países/idiomas                            |
| **Beta** | Lançamento fechado | TestFlight / teste interno Android, correções, ajustes de preço                                               |
| **4**    | PRO avançado       | Código de barras, planejamento semanal, perfis família, offline                                               |
| **5**    | IA                 | Recomendações personalizadas, busca em linguagem natural, receitas a partir do que o usuário tem              |

**MVP = fases 0 a 2 + listas de compras básicas.**

---

## 8. Decisões técnicas pendentes

| ID  | Decisão                         | Opções                                                            | Recomendação                                                    |
| --- | ------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| D01 | Framework do app                | Expo (React Native) · Flutter · Web (PWA)                         | ✅ **APROVADO: Expo + React Native + Expo Router**              |
| D02 | Backend                         | Supabase · Firebase · API própria (NestJS)                        | ✅ **APROVADO: Supabase**                                       |
| D03 | Plataformas do MVP              | Só Web · Web + Android · Web + iOS + Android                      | ✅ **APROVADO: iPhone + Android** (Web depois)                  |
| D04 | Pagamentos                      | RevenueCat · Stripe direto · lojas direto                         | ✅ **APROVADO: RevenueCat**                                     |
| D05 | **Fonte dos dados de produtos** | Curadoria própria · Open Food Facts (aberto, global) · APIs pagas | ✅ **APROVADO: Open Food Facts + curadoria** para equivalências |
| D06 | Tradução de conteúdo            | Manual · automática (IA) + revisão · só automática                | **Automática + revisão humana** no admin                        |
| D07 | Países e idiomas iniciais       | —                                                                 | ✅ **APROVADO: pt-BR, en, es · BR, US, PT, ES, UK**             |
| D08 | Preços dos planos               | Preço único em USD · preço por país                               | **Preço por país** (paridade de poder de compra)                |
| D09 | Anúncios no FREE                | Sim · Não                                                         | **Não no MVP** (decidir depois com dados)                       |
| D10 | Nome definitivo e domínio       | —                                                                 | Definir antes da publicação nas lojas                           |
| D11 | Hospedagem do admin             | Vercel · Netlify · outro                                          | **Vercel** (grátis no início)                                   |
| D12 | Analytics                       | PostHog · Firebase Analytics · Mixpanel                           | ✅ **APROVADO: PostHog**                                        |
| D13 | Contas de desenvolvedor         | Apple (US$ 99/ano) · Google (US$ 25 uma vez)                      | Necessárias antes do beta                                       |
| D14 | Termos e privacidade            | Escrever · gerador · advogado                                     | Revisão jurídica antes do lançamento                            |

---

## 9. Fase 0 — Fundação (checklist)

Cada etapa é apresentada e aprovada antes da próxima.

- [x] 1. Estrutura do monorepo
- [x] 2. Configuração do pnpm + Turborepo
- [x] 3. App Expo
- [x] 4. Painel Next.js
- [x] 5. Pacotes compartilhados (aguardando aprovação)
- [ ] 6. Configuração inicial do Supabase
- [ ] 7. i18n base (pt-BR, en, es)
- [ ] 8. Design system mínimo
- [ ] 9. Variáveis de ambiente
- [ ] 10. GitHub Actions / CI
- [ ] 11. Ambientes de desenvolvimento e produção

Fora da Fase 0: receitas, produtos, assinaturas, IA e demais funcionalidades do MVP.

## 10. Próximos passos

1. ~~Aprovar a base técnica e D03, D05, D07~~ ✅ (28/09/2026) — ver `docs/decisions/`.
2. Concluir a **Fase 0 — Fundação** (seção 9).
