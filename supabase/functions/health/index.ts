// Edge Function "health": só responde que o servidor está funcionando.
// Serve para testar a estrutura das funções — não tem regra de negócio.
//
// Local:  supabase functions serve health  →  GET http://127.0.0.1:54321/functions/v1/health
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve((request: Request): Response => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = {
    status: 'ok',
    service: 'global-food-guide',
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
