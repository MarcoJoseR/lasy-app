import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { termo } = await req.json();
  const supabase = createClient();

  if (!termo || termo.length < 2) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("receitas")
    .select("id, nome, slug, imagem_url")
    .or(
      `nome.ilike.%${termo}%,ingredientes_text.ilike.%${termo}%`
    )
    .limit(20);

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data);
}
