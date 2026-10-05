# ADR 0018 — Login, cadastro e onboarding do app mobile (Fase 1, etapa 1.4)

- **Status:** Aprovada (05/10/2026) — decisões aprovadas; implementação aguardando revisão
- **Relaciona-se com:** ADR 0015 (perfis e conteúdo público sem conta), ADR 0017 (regras de
  senha), ADR 0009 (i18n — o idioma do perfil passa a ter prioridade), ADR 0011 (variáveis)

## Contexto

O app só tinha a tela provisória da Fase 0. O banco já tem perfis com idioma, país, moeda e
unidades, criados no cadastro por gatilho (ADR 0015). Faltava o app usar contas e perfis.

## Decisões

1. **Escopo:** login, cadastro, confirmação por código e onboarding no app. Ficam para depois:
   Google/Apple, recuperação de senha no app, EAS, paywall/RevenueCat, nome de exibição, dietas,
   termos/privacidade, consentimento e abas do app.
2. **Conta opcional** (ADR 0015: conteúdo público sem conta). O **onboarding vem primeiro para
   todos**: idioma → país → moeda e unidades (o país preenche moeda e unidades, que podem mudar).
3. **Sem conta:** as escolhas ficam **no aparelho**. **Com conta:** ficam no perfil
   (`public.profiles`) e também no aparelho. Quem entra com perfil incompleto passa pelo
   onboarding (preenchido com o que já existe) antes do início.
4. **Cadastro** com e-mail e senha (8 caracteres a 72 bytes — ADR 0017), enviando `locale` e
   `country_code` nos metadados; o gatilho `handle_new_user` cria o perfil e deriva moeda e
   unidades. Ao confirmar, o app conclui o perfil com as escolhas do onboarding.
5. **Confirmação por código de exatamente 6 dígitos** (`verifyOtp`, tipo `signup`), digitado no
   app — sem links que abrem o app. "Reenviar código" só depois de 60 segundos (o Supabase
   recusa antes disso). O e-mail pendente fica só na memória (nunca na URL ou no disco).
6. **Login** com e-mail e senha. E-mail não confirmado (só acontece com a senha certa) leva à
   tela do código e pede um código novo.
7. **Sem revelar contas:** senha errada e e-mail inexistente têm a mesma mensagem; cadastro com
   e-mail que já tem conta mostra a **mesma tela do código** de um cadastro novo (o Supabase
   devolve `user_already_exists`; o app trata igual e nenhum código é enviado); "reenviar"
   responde "enviado" em qualquer caso, menos limite de envios.
8. **Sessão no celular criptografada:** uma chave AES-256 fica no **SecureStore**
   (Keychain/Keystore, só neste aparelho e só desbloqueado); a sessão é criptografada com
   **AES-GCM do `expo-crypto`** (nativo, funciona no Expo Go) e guardada no **AsyncStorage**.
   Chave ausente ou dado adulterado → a sessão é descartada. Na **web**, `localStorage` (padrão do
   Supabase), com proteção para a geração estática das páginas (`web.output: "static"` mantido).
   Não foi preciso `aes-js`: o `expo-crypto` do SDK 57 já tem AES-GCM.
9. **Navegação** com rotas protegidas do Expo Router (`Stack.Protected`): a decisão "onboarding
   ou início" é uma função pura em `@gfg/core` (`decideAppRoute`), com testes; entrar/criar conta
   só aparecem sem conta.
10. **Idioma:** perfil > escolha no aparelho > idioma do celular (`resolveAppLocale`, em
    `@gfg/i18n`). Atualiza a ADR 0009, que previa essa prioridade.
11. **Segurança:** só a chave pública (nenhuma `service_role`); a RLS do perfil garante que cada um
    só lê/altera o próprio; nenhum log de senha, token, código ou e-mail; erros do Supabase viram
    mensagens fixas (`mapAppAuthError`, `mapOtpError`).
12. **Sem migration:** o esquema da 1.1 já atende (gatilho com metadados, RLS do dono, alteração
    só nas colunas editáveis, restrição do onboarding completo).

## Consequências

- **Configuração manual no Supabase Dev** (depois da revisão): modelo do e-mail "Confirm signup"
  com `{{ .Token }}` e código de 6 dígitos — `docs/SUPABASE.md`, seção 5.5.
- O Supabase devolve `user_already_exists` para quem chama a API direto, então a proteção contra
  descobrir contas vale para o app, não para chamadas diretas à API (limite do Supabase Auth).
- O Supabase local continua com a confirmação desligada (`supabase/config.toml`); com ela
  desligada, o cadastro entra direto, sem código. O modelo local do e-mail com código fica em
  `supabase/templates/confirmation.html`.
- Testes: regras em `@gfg/core`/`@gfg/i18n` (automáticos); fluxo completo testado na versão web
  contra um Supabase local com confirmação ligada e caixa de e-mails de teste (Mailpit). O
  armazenamento criptografado do celular só roda no aparelho (Expo Go), não na web — o teste no
  celular é manual.
