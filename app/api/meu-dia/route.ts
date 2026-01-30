console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "SERVICE_ROLE_KEY existe?",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔹 GET: retorna todos os IDs das receitas adicionadas ao Meu Dia
export async function GET() {
  const { data, error } = await supabase.from("meu_dia").select("receita_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = data.map((item) => item.receita_id);
  return NextResponse.json({ data: ids });
}

// 🔹 POST: adiciona uma receita ao Meu Dia
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receita_id } = body;
    console.log("BODY RECEBIDO:", body)
    if (!receita_id) {
      return NextResponse.json({ error: "receita_id é obrigatório" }, { status: 400 });
    }

    const { error } = await supabase.from("meu_dia").insert([{ receita_id }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🔹 DELETE: remove uma receita do Meu Dia
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { receita_id } = body;

    if (!receita_id) {
      return NextResponse.json({ error: "receita_id é obrigatório" }, { status: 400 });
    }

    const { error } = await supabase.from("meu_dia").delete().eq("receita_id", receita_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
