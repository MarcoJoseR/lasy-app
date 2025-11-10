import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Conexão com o Supabase usando variáveis do .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const receitas = Array.isArray(body) ? body : [body];

    let inseridas = 0;
    let duplicadas = 0;

    for (const r of receitas) {
      const nome = r.nome?.trim();
      const ingredientes = r.ingredientes?.trim();
      const modo_preparo = r.modo_preparo?.trim();

      if (!nome || !ingredientes || !modo_preparo) continue;

      // Verifica duplicidade no Supabase
      const { data: existente } = await supabase
        .from("receitas")
        .select("id")
        .eq("nome", nome)
        .maybeSingle();

      if (existente) {
        duplicadas++;
        continue;
      }

      // Insere nova receita com origem 'lasy'
      const { error } = await supabase.from("receitas").insert([
        {
          nome,
          ingredientes,
          modo_preparo,
          origem: "lasy",
          created_at: new Date().toISOString(),
        },
      ]);

      if (!error) inseridas++;
    }

    return NextResponse.json({
      sucesso: true,
      inseridas,
      duplicadas,
      mensagem: `Importação concluída. ${inseridas} inseridas, ${duplicadas} duplicadas.`,
    });
  } catch (e: any) {
    console.error("Erro ao importar receitas:", e);
    return NextResponse.json({ sucesso: false, erro: e.message });
  }
}
