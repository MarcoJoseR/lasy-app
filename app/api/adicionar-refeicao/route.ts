// app/api/adicionar-refeicao/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔹 Supabase backend client (usar Service Role, não expor no frontend)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("👉 BODY RECEBIDO NO POST:", body);

    const { receita_id } = body;

    if (!receita_id) {
      return NextResponse.json(
        { error: "receita_id não enviado" },
        { status: 400 }
      );
    }

    // Inserir na tabela meu_dia
    const { data, error } = await supabase
      .from("meu_dia")
      .insert({ receita_id })
      .select(); // Retorna o registro inserido para debug/uso futuro

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Retorna o registro criado
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no POST adicionar-refeicao:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
