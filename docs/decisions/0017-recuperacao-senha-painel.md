# ADR 0017 — Recuperação de senha do painel (Fase 1, etapa 1.3)

- **Status:** Aprovada (03/10/2026) — implementada (commit `d2685ef`)
- **Relaciona-se com:** ADR 0016 (login do painel), ADR 0013 (ambientes — **substitui o item 3**:
  a sessão sem login passa a valer só em `development`), ADR 0011 (variáveis de ambiente)

## Contexto

A ADR 0016 deixou o "esqueci minha senha" para depois. Sem ele, quem esquece a senha do painel
depende de alguém com acesso ao site do Supabase. A auditoria da etapa 1.3 também encontrou um
risco antigo: com `ADMIN_AUTH_MODE=disabled`, a sessão simulada (sem login) valia em qualquer
ambiente que não fosse `production` — inclusive `staging`.

## Decisões

1. **Escopo:** só a recuperação de senha do **painel**. Login, cadastro e onboarding do app ficam
   para uma etapa futura.
2. **Fluxo:** `/login` → "Esqueci minha senha" → `/esqueci-senha` (e-mail) → e-mail com link →
   `/auth/confirmar` (valida) → `/nova-senha` (nova senha + confirmação) → `/login` com
   "senha alterada".
3. **Link com `token_hash` + `verifyOtp({ type: 'recovery' })`.** O link funciona em qualquer
   navegador ou aparelho (não depende de cookie do navegador que pediu, como no fluxo PKCE).
   O pedido usa um cliente Supabase **sem sessão** (fluxo `implicit`); a validação usa o cliente
   com cookies, que cria a sessão. O modelo do e-mail precisa ter
   `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`
   (local: `supabase/templates/recovery.html`; dev: configurado no site do Supabase —
   `docs/SUPABASE.md`, seção 5.4).
4. **`NEXT_PUBLIC_ADMIN_URL`** é o endereço do painel usado no `redirectTo`
   (`<NEXT_PUBLIC_ADMIN_URL>/auth/confirmar`). **Nunca** é montado a partir do Host/Origin da
   requisição. Validada no `env.ts`: só a origem; em `development`, vazia → `http://localhost:3000`;
   em `staging`/`production`, precisa ser `https://` e não local — senão a recuperação fica
   desligada (com erro no log).
5. **Não revelar contas:** pedir a recuperação responde **sempre a mesma mensagem**. Erros do
   Supabase (conta inexistente, limite de envios, limite por usuário) são ignorados de propósito.
6. **Token fora da URL e dos logs:** `/auth/confirmar` valida e redireciona na hora para
   `/nova-senha` (sem token). As páginas do fluxo e o `/login` enviam
   `Referrer-Policy: no-referrer` e `Cache-Control: no-store`. O `next dev` não registra
   `/auth/confirmar` no terminal. O código nunca registra token nem código.
7. **Destinos fixos:** nenhum `next=`/redirect vindo da URL é aceito. `?erro=` e `?aviso=` só
   aceitam códigos de listas fixas.
8. **`/nova-senha` exige o link do e-mail:** além da sessão, um cookie **marca de recuperação**
   (`HttpOnly`, mesmas opções dos cookies de sessão, 15 minutos, guarda só o id do usuário) é
   gravado por `/auth/confirmar`. Uma sessão comum do painel não troca a senha por ali.
9. **Depois da troca:** `signOut({ scope: 'others' })` encerra as outras sessões da conta; a
   sessão deste navegador também é encerrada, e a pessoa volta para `/login` com "senha
   alterada" e entra de novo com a senha nova.
10. **Papel:** quem não é `editor`/`admin` pode recuperar a senha, mas continua sem acesso ao
    painel (a regra da ADR 0016 não muda). A sessão aberta pelo link também não entra no painel.
11. **Senha nova:** mínimo de **8 caracteres** (acento e emoji contam 1) e máximo de **72 bytes**
    UTF-8 (limite do bcrypt usado pelo Supabase; acento = 2 bytes, emoji = 4). Confirmação
    obrigatória e igual. Erros `weak_password` e `same_password` com mensagens próprias; os
    demais viram mensagens genéricas. Regras em `@gfg/core` (`password.ts`), com testes. O login
    também passou a limitar a senha em **bytes**.
12. **Sessão sem login só em `development`** (substitui o item 3 da ADR 0013): com
    `ADMIN_AUTH_MODE=disabled`, `staging` e `production` recusam a sessão simulada, enviam para
    `/login` e registram erro. Regra em `@gfg/core` (`allowsUnauthenticatedAdmin`), com testes.

## Consequências

- **Configuração manual no Supabase Dev** (depois da revisão, pelo dono do projeto):
  URL permitida `http://localhost:3000/auth/confirmar` e o modelo do e-mail "Reset password"
  com `token_hash` — passo a passo em `docs/SUPABASE.md`, seção 5.4. Sem isso, o e-mail do dev
  continua com o link padrão do Supabase, que **não** funciona com o painel.
- O e-mail embutido do Supabase tem limite baixo de envios e pode enviar só para membros da
  equipe do projeto; antes do beta é preciso SMTP próprio.
- O link é de uso único. Programas de segurança de e-mail que "abrem" links para verificá-los
  podem gastá-lo antes da pessoa — nesse caso, basta pedir outro link.
- Não há limite próprio de pedidos: vale o do Supabase Auth.
- Testes: regras em `@gfg/core` (automáticos); fluxo completo testado no navegador contra um
  Supabase local com caixa de e-mails de teste (Mailpit) antes do commit. Ainda sem testes de
  navegador na CI.
