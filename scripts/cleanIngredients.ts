// scripts/cleanIngredients.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.script" });

import { createClient } from "@supabase/supabase-js";

// Conexão Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanIngredients() {
  const { data: receitas, error } = await supabase
    .from("receitas")
    .select("*");

  if (error) {
    console.error("Erro ao buscar receitas:", error);
    return;
  }

  if (!receitas || receitas.length === 0) {
    console.log("Nenhuma receita encontrada.");
    return;
  }

  for (const r of receitas) {
    // força tipagem no loop
    const id: number = r.id;
    const nome: string = r.nome;
    const modo_preparo: string = r.modo_preparo;
    let ingredientes: string[] = [];

    if (Array.isArray(r.ingredientes)) {
      ingredientes = r.ingredientes;
    } else if (typeof r.ingredientes === "string") {
      try {
        const parsed = JSON.parse(r.ingredientes);
        ingredientes = Array.isArray(parsed) ? parsed : r.ingredientes.split(",").map((s: string) => s.trim());
      } catch {
        ingredientes = r.ingredientes.split(",").map((s: string) => s.trim());
      }
    }

    const { error: updateError } = await supabase
      .from("receitas")
      .update({ ingredientes })
      .eq("id", id);

    if (updateError) {
      console.error(`Erro ao atualizar "${nome}":`, updateError);
    } else {
      console.log(`Receita "${nome}" atualizada.`);
    }
  }

  console.log("Processo concluído.");
}

cleanIngredients();
