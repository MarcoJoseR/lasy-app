"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET() {
  try {
    // 1️⃣ Buscar refeições de HOJE
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    let { data, error } = await supabase
      .from("refeicoes_diarias")
      .select(`
        id,
        quantidade,
        hora,
        receitas (
          id,
          nome,
          imagem_url,
          descricao,
          ingredientes,
          modo_preparo,
          categoria,
          subcategoria,
          dificuldade,
          tempo_preparo,
          porcoes,
          favorito
        )
      `)
      .gte("data", hoje.toISOString())
      .lt("data", amanha.toISOString())
      .order("hora", { ascending: true });

    if (error) throw error;

    // 2️⃣ Se NÃO houver refeições hoje → buscar o ÚLTIMO dia com registros
    if (!data || data.length === 0) {
      const { data: ultimaData, error: erroUltima } = await supabase
        .from("refeicoes_diarias")
        .select("data")
        .order("data", { ascending: false })
        .limit(1)
        .single();

      if (erroUltima || !ultimaData) {
        return NextResponse.json([]);
      }

      const inicio = new Date(ultimaData.data);
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 1);

      const resposta = await supabase
        .from("refeicoes_diarias")
        .select(`
          id,
          quantidade,
          hora,
          receitas (
            id,
            nome,
            imagem_url,
            descricao,
            ingredientes,
            modo_preparo,
            categoria,
            subcategoria,
            dificuldade,
            tempo_preparo,
            porcoes,
            favorito
          )
        `)
        .gte("data", inicio.toISOString())
        .lt("data", fim.toISOString())
        .order("hora", { ascending: true });

      if (resposta.error) throw resposta.error;

      data = resposta.data;
    }

    // 3️⃣ Agrupar por receita (mantém compatibilidade com o front)
    const agrupadas = data!.reduce((acc: any[], item: any) => {
      const receitaId = item.receitas.id;

      let entry = acc.find((r) => r.receita.id === receitaId);

      if (!entry) {
        entry = { receita: item.receitas, ocorrencias: [] };
        acc.push(entry);
      }

      entry.ocorrencias.push({
        id: item.id,
        quantidade: item.quantidade,
        hora: item.hora,
      });

      return acc;
    }, []);

    return NextResponse.json(agrupadas);
  } catch (error: any) {
    console.error("Erro API refeicoes-dia:", error);
    return NextResponse.json(
      { message: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}
