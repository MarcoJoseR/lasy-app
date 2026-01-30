// lib/embeddings/embeddings.ts
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
}

export async function updateEmbeddingForRecipe(
  receitaId: number,
  ingredientesText: string
) {
  const vector = await generateEmbedding(ingredientesText);

  await supabase
    .from("receitas")
    .update({ embedding_vector: vector })
    .eq("id", receitaId);
}
