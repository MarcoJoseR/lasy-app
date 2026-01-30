import { createSupabaseServerClient } from "../supabase/server";
import type { Receita } from "../embeddings/types";

export async function getReceitaBySlug(
  slug: string
): Promise<Receita | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("receitas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Erro ao buscar receita por slug:", error);
    return null;
  }

  return data as Receita;
}
