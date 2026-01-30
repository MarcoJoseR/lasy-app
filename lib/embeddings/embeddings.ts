import { openai } from "../openai";
import { supabase } from "../supabase/server";
import type { Receita } from "./types.js";
import { retry } from "./helpers";

export async function generateEmbedding(text: string) {
  if (!text || text.trim().length === 0) return null;
  const resp = await retry(
    () =>
      openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
      }),
    3,
    500
  );
  return resp?.data?.[0]?.embedding ?? null;
}

export async function updateEmbeddingForRecipe(recipeId: number, embedding: number[] | null) {
  if (!recipeId || !embedding) return false;
  const { error } = await supabase
    .from("receitas")
    .update({ embedding })
    .eq("id", recipeId);
  if (error) {
    console.error("Supabase update error:", error);
    return false;
  }
  return true;
}
