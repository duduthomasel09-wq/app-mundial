# ADR 0016 — Login real do painel administrativo (Fase 1, etapa 1.2)

- **Status:** Aprovada (03/10/2026) — implementada (commit `6a4bbc0`) · "esqueci minha senha"
  implementado pela [ADR 0017](0017-recuperacao-senha-painel.md)
- **Relaciona-se com:** ADR 0006 (painel — atualiza a parte de autenticação), ADR 0011
  (variáveis de ambiente), ADR 0013 (ambientes), ADR 0015 (papéis `editor`/`admin`)

## Contexto

A ADR 0006 deixou o painel preparado para o login (`getAdminSession()` como ponto único,
`ADMIN_AUTH_MODE`), e a ADR 0015 criou no banco os papéis `editor`/`admin`, a função
`has_role()` e a RLS. Faltava ligar as duas pontas: entrar no painel com uma conta real do
Supabase Auth e liberar o acesso só para quem tem papel.

## Decisões

1. **Login só com e-mail e senha.** Sem cadastro no painel (as contas nascem no app ou no site
   do Supabase). "Esqueci minha senha" fica para a etapa 1.3 (feito na ADR 0017, só no painel).
2. **Quem entra:** só `editor` ou `admin` (`admin` inclui `editor` — ADR 0015, H2). A regra fica
   em `@gfg/core` (`decideAdminAccess`, `highestStaffRole`), com testes.
3. **Sem papel → sessão encerrada.** No login, a sessão recém-criada é encerrada na hora e a tela
   mostra "sem permissão". Se o papel for removido durante a sessão, o próximo acesso vai para
   `/sem-permissao`, que encerra a sessão e volta para `/login?erro=no_permission` (essa rota só
   desconecta quem realmente não tem permissão).
4. **Sessão real em cookies** com `@supabase/ssr` + `@supabase/supabase-js` (versões fixas). Os
   cookies são **`HttpOnly`**, `SameSite=Lax` e **`Secure`** fora do desenvolvimento — o painel
   não usa cliente Supabase no navegador, então nenhum JavaScript da página precisa lê-los.
5. **Tudo no servidor.** Entrar e sair são **Server Actions**; `getAdminAccess()` confirma o
   usuário no servidor do Supabase (`auth.getUser()`, não só o cookie) e lê os papéis em
   `user_roles` (a RLS só mostra os do próprio usuário) **a cada acesso** às páginas do painel.
   Se o banco não responder, dá erro — nunca libera nem recusa "no escuro".
6. **`proxy.ts`** (convenção do Next 16, antigo `middleware.ts`) só **renova a sessão**
   (`auth.getClaims()`) e grava os cookies novos, com cabeçalhos que impedem cache. Ele **não**
   decide quem entra: isso é do layout do painel (servidor) e, no banco, da RLS.
7. **Só a chave pública.** Nenhuma `service_role`/chave secreta no painel — nem no servidor.
8. **`ADMIN_AUTH_MODE`** continua `disabled` por padrão no desenvolvimento (sessão simulada, como
   antes). `supabase` liga o login real; sem URL ou chave pública, ninguém entra e o painel
   registra um **erro** de configuração. Em produção, `disabled` continua bloqueado (ADR 0013).
9. **Papel nos tipos:** o painel usa `StaffRole` do `@gfg/core` (o `AdminRole` duplicado foi
   removido).
10. **Mensagens de erro** sem revelar se a conta existe: e-mail inexistente e senha errada
    mostram o mesmo texto. Os códigos do Supabase viram motivos fixos (`mapSignInErrorCode`);
    a mensagem original nunca aparece para o usuário.

## Consequências

- Para usar o login no desenvolvimento: `ADMIN_AUTH_MODE=supabase` + URL e chave pública do
  projeto de dev em `apps/admin/.env.local` (veja `docs/SUPABASE.md`, seção 5.3).
- Editor e admin veem o mesmo painel por enquanto (só existe o Dashboard). A diferença aparece
  quando as telas de conteúdo e de usuários/papéis existirem (etapas 1.5 e 1.12).
- A sessão vale enquanto o refresh token for válido; o `proxy.ts` troca o token vencido a cada
  acesso. "Sair" encerra só a sessão deste navegador (`scope: 'local'`).
- Limites conhecidos: conta **banida** (`banned_until`) não é tratada à parte — o Supabase
  recusa o login e a renovação, mas um token já emitido pode continuar valendo até vencer
  (até 1 hora). Não há
  limite próprio de tentativas: vale o limite do Supabase Auth.
- Os testes automáticos cobrem a regra de acesso (`@gfg/core`). O fluxo completo (login, sem
  papel, editor, admin, sair, renovação) foi conferido num Supabase local antes do commit; ainda
  não há testes de navegador na CI.
