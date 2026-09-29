// Cabeçalhos CORS compartilhados pelas Edge Functions.
// Permitem chamadas do painel (navegador). O app mobile não precisa de CORS.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};
