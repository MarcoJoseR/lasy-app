import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function updateEmbeddings() {
  try {
    const { data: receitas, error } = await supabase
      .from("receitas")
      .select("id, ingredientes_text")
      .is("embedding_vector", null);

    if (error) throw error;
    if (!receitas || receitas.length === 0) {
      console.log("Nenhuma receita sem embedding encontrado.");
      return;
    }

    console.log(`Atualizando embeddings de ${receitas.length} receitas...`);

    for (const receita of receitas) {
      const text = receita.ingredientes_text || receita.descricao || "";
      if (!text) continue;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text
      });

      const embeddingVector = embeddingResponse.data[0].embedding;

      const { error: updateError } = await supabase
        .from("receitas")
        .update({ embedding_vector: embeddingVector })
        .eq("id", receita.id);

      if (updateError) console.error(`Erro ao atualizar receita ${receita.id}:`, updateError);
      else console.log(`Receita ${receita.id} atualizada.`);
    }

    console.log("Todos os embeddings foram atualizados com sucesso.");
  } catch (err) {
    console.error("Erro no updateEmbeddings:", err);
  }
}

updateEmbeddings();
