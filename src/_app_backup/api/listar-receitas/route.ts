import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GET /api/listar-receitas ---
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('receitas')
      .select('id, nome, ingredientes, categoria, tempo, imagem_url')
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao buscar receitas:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Garante formato consistente de array JSON
    const receitasFormatadas = data.map((item) => ({
      ...item,
      ingredientes:
        Array.isArray(item.ingredientes) || item.ingredientes === null
          ? item.ingredientes
          : (() => {
              try {
                return JSON.parse(item.ingredientes);
              } catch {
                return [];
              }
            })(),
    }));

    return NextResponse.json({
      success: true,
      total: receitasFormatadas.length,
      receitas: receitasFormatadas,
    });
  } catch (err: any) {
    console.error('Erro geral na rota listar-receitas:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
