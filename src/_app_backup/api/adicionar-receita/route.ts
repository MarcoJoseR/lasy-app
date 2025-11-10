// route.ts da API adicionar-receita
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  const { nome, ingredientes, modo_preparo } = await req.json();

  // Verifica duplicidade pelo nome
  const { data: existente } = await supabase
    .from('receitas')
    .select('*')
    .eq('nome', nome);

  if (existente && existente.length > 0) {
    return new Response(JSON.stringify({ success: false, message: 'Receita já existe' }), { status: 200 });
  }

  const { data, error } = await supabase
    .from('receitas')
    .insert([{ nome, ingredientes, modo_preparo }]);

  if (error) return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true, data }));
}
