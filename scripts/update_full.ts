import * as dotenv from "dotenv";
dotenv.config({ path: ".env" }); // Força carregamento no Windows

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function gerarEmbedding(texto: string) {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: texto,
  });

  return result.data[0].embedding;
}

async function processar() {
  const { data: receitas, error: errorReceita } = await supabase
    .from("receitas")
    .select("*");

  if (errorReceita) {
    console.error("Erro ao buscar receitas:", errorReceita);
    return;
  }

  if (!receitas || receitas.length === 0) {
    console.log("Nenhuma receita encontrada.");
    return;
  }

  for (const receita of receitas) {
    console.log(`=== Receita ID ${receita.id}: ${receita.nome} ===`);

    if (!receita.embedding_vector) {
      console.log("⚠️ Embedding ausente. Gerando...");

      const embedding = await gerarEmbedding(
        receita.descricao || receita.preparo_text || receita.nome
      );

      console.log("✅ Embedding gerado. Atualizando no Supabase...");

      const { error } = await supabase
        .from("receitas")
        .update({ embedding_vector: embedding })
        .eq("id", receita.id);

      if (error) {
        console.error("Erro ao atualizar embedding:", error);
        continue;
      }

      // 🔥 ESSENCIAL → sem isso o RPC recebe null!
      receita.embedding_vector = embedding;
    }

    console.log("→ Testando similares...");

    const { data, error } = await supabase.rpc("match_recipes_embedding", {
      input_embedding: receita.embedding_vector,
      receita_id: receita.id,
      match_threshold: 0.6,
      match_count: 6,
    });

    if (error) {
      console.error("❌ Erro ao buscar similares:", error);
    } else {
      console.log("Similares encontrados:", data?.length || 0);
    }

    console.log();
  }
}

processar();
