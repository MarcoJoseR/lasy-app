import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Detecta ambiente automaticamente
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Gera embedding de um texto via OpenAI
 */
export async function generateEmbedding(texto) {
  try {
    if (!texto || texto.trim().length === 0) return null;

    const resp = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texto,
    });

    return resp.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("Erro ao gerar embedding:", err);
    return null;
  }
}

/**
 * Atualiza embedding de uma receita no banco
 */
export async function updateRecipeEmbedding(id, embedding) {
  try {
    const { error } = await supabase
      .from("receitas")
      .update({ embedding })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar embedding:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erro updateRecipeEmbedding:", err);
    return false;
  }
}
