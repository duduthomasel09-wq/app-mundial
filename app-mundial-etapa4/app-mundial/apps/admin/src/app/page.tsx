import { redirect } from 'next/navigation';

/** A raiz do painel leva direto para o Dashboard. */
export default function HomePage() {
  redirect('/dashboard');
}
