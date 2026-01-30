import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getSimilarRecipes(recipeId: number, recipeTitle: string) {
  try {
    // 1. Criar embedding do título
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: recipeTitle,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // 2. Buscar similares no Supabase
    const { data, error } = await supabase.rpc("match_recipes", {
      query_embedding: embedding,
      match_count: 5,
      reference_recipe_id: recipeId,
    });

    if (error) {
      console.error("Erro no match_recipes:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Erro getSimilarRecipes:", err);
    return [];
  }
}
