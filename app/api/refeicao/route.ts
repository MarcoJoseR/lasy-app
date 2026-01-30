import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { receitaId, quantidade } = await req.json();

    if (!receitaId) {
      return NextResponse.json(
        { error: "receitaId é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from("refeicoes_diarias")
      .insert({
        receita_id: receitaId,
        quantidade: quantidade ?? 1,
        data: new Date().toISOString().split("T")[0],
      });

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro endpoint /api/refeicao:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
