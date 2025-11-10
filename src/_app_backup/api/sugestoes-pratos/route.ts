import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // Log de chamada da rota
    console.log('Rota /api/sugestoes-pratos chamada');

    // Buscar a primeira receita no Supabase
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);

    // Log do retorno do Supabase
    console.log('Data recebida do Supabase:', data, error);

    if (error) {
      console.error('Erro ao buscar dados no Supabase:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500 }
      );
    }

    // Retornar a primeira receita ou null
    return new Response(
      JSON.stringify({ success: true, data: data[0] || null }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Erro inesperado na rota /sugestoes-pratos:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
