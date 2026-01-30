import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { createClient } from "@supabase/supabase-js";
import { getSimilarRecipesEmbedding } from "../lib/getSimilarRecipesEmbedding.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ------------------------------------------------------------
// LOG HEADER
// ------------------------------------------------------------
console.log("==============================================");
console.log("🔄 ATUALIZAÇÃO DE RECOMENDAÇÕES - INICIADA");
console.log("==============================================\n");

// ------------------------------------------------------------
// FUNÇÃO PRINCIPAL
// ------------------------------------------------------------
async function atualizarRecomendacoes() {
  try {
    console.log("📡 Buscando receitas com embeddings ausentes...");

    const { data: receitas, error } = await supabase
      .from("receitas")
      .select("id, descricao, similares")
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Erro ao buscar receitas:", error);
      return;
    }

    console.log(`📄 Total de receitas carregadas: ${receitas.length}\n`);

    for (const receita of receitas) {
      console.log(`=== Receita ID ${receita.id} ===`);

      const descricao = receita.descricao?.trim();
      if (!descricao) {
        console.log("⚠️ Descrição vazia — ignorando.");
        continue;
      }

      // 1) Obter similares por embedding
      console.log("🔍 Gerando recomendações...");
      const similares = await getSimilarRecipesEmbedding(
        descricao,
        receita.id,
        { match_threshold: 0.75, match_count: 6 }
      );

      if (!similares || similares.length === 0) {
        console.log("⚠️ Nenhuma recomendação encontrada.");
        continue;
      }

      // 2) Atualizar campo "similares"
      console.log("💾 Gravando recomendações no banco...");

      const { error: updateError } = await supabase
        .from("receitas")
        .update({ similares })
        .eq("id", receita.id);

      if (updateError) {
        console.error("❌ Erro ao atualizar receita:", updateError);
      } else {
        console.log(`✅ Atualizado com sucesso. (${similares.length} itens)\n`);
      }
    }

    console.log("==============================================");
    console.log("🎉 PROCESSO CONCLUÍDO COM SUCESSO");
    console.log("==============================================");
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
  }
}

// ------------------------------------------------------------
// EXECUÇÃO
// ------------------------------------------------------------
atualizarRecomendacoes();
