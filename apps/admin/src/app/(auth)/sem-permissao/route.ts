import { redirect } from 'next/navigation';

import { getAdminAccess } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Depende da sessão de quem acessa: nunca gerar como página estática.
export const dynamic = 'force-dynamic';

/**
 * Para onde o painel manda quem tem login válido mas **não** tem papel `editor`/`admin`
 * (ex.: o papel foi removido durante a sessão). Encerra a sessão deste navegador e volta
 * para /login com a mensagem "sem permissão" (ADR 0016).
 *
 * Só encerra a sessão se o acesso for mesmo recusado — um link para esta página não
 * desconecta quem tem permissão.
 */
export async function GET() {
  const access = await getAdminAccess();

  if (access.status === 'signed_in') redirect('/dashboard');

  if (access.status === 'forbidden') {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut({ scope: 'local' });
    redirect('/login?erro=no_permission');
  }

  redirect('/login');
}
