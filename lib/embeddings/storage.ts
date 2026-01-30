import { createSupabaseServerClient } from "../supabase/server";
import type { Receita } from "./types";

function getSupabase() {
  return createSupabaseServerClient();
}

export async function getPendingRecipes(limit = 100): Promise<Receita[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("receitas")
    .select("id, nome, descricao, ingredientes_text, embedding")
    .is("embedding", null)
    .limit(limit)
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro getPendingRecipes:", error);
    return [];
  }

  return data as Receita[];
}

export async function getAllRecipesBatch(
  limit = 1000,
  offset = 0
): Promise<Receita[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("receitas")
    .select("id, nome, descricao, ingredientes_text, embedding")
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Erro getAllRecipesBatch:", error);
    return [];
  }

  return data as Receita[];
}
