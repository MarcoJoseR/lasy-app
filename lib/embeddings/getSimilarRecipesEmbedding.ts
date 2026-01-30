import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function getSimilarRecipesEmbedding(
  descricao: string,
  receitaId: number,
  options = {
    match_threshold: 0.60,
    match_count: 6,
  }
) {
  try {
    // 1) Gerar embedding do texto
    const embeddingResult = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: descricao,
    });

    const embedding = embeddingResult.data[0].embedding;

    // 2) Chamar função RPC
    const { data, error } = await supabase.rpc("match_recipes_embedding", {
      input_embedding: embedding,
      receita_id: receitaId,
      match_threshold: options.match_threshold,
      match_count: options.match_count,
    });

    if (error) {
      console.error("Erro no RPC match_recipes_embedding:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Erro geral em getSimilarRecipesEmbedding:", err);
    return [];
  }
}
