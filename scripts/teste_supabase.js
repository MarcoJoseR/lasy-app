import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // correto para atualização de embeddings
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function gerarEmbedding(texto) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: texto
  });

  return response.data[0].embedding;
}

async function processarReceitas() {
  const { data: receitas, error } = await supabase
    .from("receitas")
    .select("id, descricao, embedding");

  if (error) {
    console.error("Erro ao carregar receitas:", error);
    return;
  }

  for (const r of receitas) {
    console.log(`\n=== Receita ID ${r.id} ===`);

    if (r.embedding) {
      console.log("➡️ Embedding já existe. Pulando.");
      continue;
    }

    console.log("⚠️ Embedding ausente. Gerando...");

    const embedding = await gerarEmbedding(r.descricao);

    console.log("✅ Embedding gerado. Atualizando no Supabase...");

    const { error: updateError } = await supabase
      .from("receitas")
      .update({ embedding })
      .eq("id", r.id);

    if (updateError) {
      console.error("Erro ao salvar embedding:", updateError);
      continue;
    }

    console.log("🔥 Embedding atualizado com sucesso!");
  }
}

processarReceitas();
