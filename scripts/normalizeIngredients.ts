import dotenv from "dotenv";
dotenv.config({ path: ".env.script" });

import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Interface da Receita
interface Receita {
  id: number;
  nome: string;
  ingredientes: string | string[];
  modo_preparo: string;
}

async function normalizeIngredients() {
  // Etapa 1: Buscar todas as receitas
  const { data: receitas, error } = await supabase
    .from("receitas")
    .select("*") as { data: Receita[] | null, error: any };

  if (error) {
    console.log("Erro ao buscar receitas:", error);
    return;
  }

  if (!receitas) return;

  for (const r of receitas) {
    let clean: string[] = [];

    // Etapa 2: Normalizar ingredientes
    if (Array.isArray(r.ingredientes)) {
      clean = r.ingredientes.map((i: string) => i.trim());
    } else if (typeof r.ingredientes === "string") {
      // remove colchetes e aspas
      const stripped = r.ingredientes.replace(/^\[|]$/g, "").replace(/"/g, "");
      clean = stripped.split(",").map(i => i.trim());
    }

    // Etapa 3: Atualizar no Supabase
    const { error: updateError } = await supabase
      .from("receitas")
      .update({ ingredientes: clean })
      .eq("id", r.id);

    if (updateError) {
      console.log(`❌ Erro ao atualizar "${r.nome}":`, updateError);
    } else {
      console.log(`✅ Receita "${r.nome}" atualizada com sucesso:`, clean);
    }
  }

  console.log("📌 Processo de normalização concluído!");
}

// Executa a função
normalizeIngredients();
