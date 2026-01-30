import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

// 🔧 Corrige o path da imagem com base na estrutura real
function fixImagePath(
  imagem: string | null,
  categoria_slug: string | null,
  subcategoria: string | null
) {
  if (!imagem || imagem.trim() === "") {
    return "/images/receitas/sem-imagem.jpg";
  }

  // Se já estiver no padrão correto
  if (imagem.startsWith("/images/receitas/")) {
    return imagem;
  }

  if (!categoria_slug || !subcategoria) {
    return "/images/receitas/sem-imagem.jpg";
  }

  // Extrai apenas o nome do arquivo (ex: 1.jpg)
  const fileName = imagem.includes("/")
    ? imagem.split("/").pop()
    : imagem;

  return `/images/receitas/${categoria_slug}/${subcategoria}/${fileName}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const categoria = searchParams.get("categoria");
  const limit = Number(searchParams.get("limit") ?? 6);
  const page = Number(searchParams.get("page") ?? 1);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("receitas")
    .select("*")
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (categoria) {
    query = query.eq("categoria_slug", categoria);
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const receitasCorrigidas =
    data?.map((r) => ({
      ...r,
      imagem: fixImagePath(r.imagem, r.categoria_slug, r.subcategoria),
    })) ?? [];

  return NextResponse.json(receitasCorrigidas);
}
