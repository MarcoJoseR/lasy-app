import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Detecta automaticamente ambiente (Next.js ou Node)
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error("❌ Erro: SUPABASE_URL não encontrada.");
  throw new Error("SUPABASE_URL ausente.");
}

if (!SUPABASE_ANON_KEY) {
  console.error("❌ Erro: SUPABASE_ANON_KEY não encontrada.");
  throw new Error("SUPABASE_ANON_KEY ausente.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSimilarRecipesEmbedding(texto, currentId, opts) {
  try {
    if (!texto || texto.trim().length === 0) return [];

    const match_threshold = opts?.match_threshold ?? 0.78;
    const match_count = opts?.match_count ?? 5;

    // ➜ Gera embedding
    const resp = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texto,
    });

    const embedding = resp.data?.[0]?.embedding;
    if (!embedding) return [];

    // ➜ Chama a função PostgreSQL match_recipes
    const { data, error } = await supabase.rpc("match_recipes", {
      match_count,
      match_threshold,
      query_embedding: embedding,
    });

    if (error) {
      console.error("Erro RPC match_recipes:", error);
      return [];
    }

    // ➜ Remove a própria receita da lista
    if (Array.isArray(data)) {
      if (currentId) {
        return data.filter((r) => r.id !== currentId);
      }
      return data;
    }

    return [];
  } catch (err) {
    console.error("Erro getSimilarRecipesEmbedding:", err);
    return [];
  }
}
