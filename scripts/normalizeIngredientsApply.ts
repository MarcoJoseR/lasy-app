import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// 🔹 Corrige __dirname em ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔹 Carrega .env.script
dotenv.config({ path: resolve(__dirname, '../.env.script') });

// 🔹 Supabase com Service Role Key
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env.script");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Tipagem da receita
type Receita = {
  id: number;
  ingredientes: string[];
};

// 🔹 Função de normalização
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// 🔹 Cria backup antes de atualizar
async function backupReceitas() {
  const { data, error } = await supabase.from("receitas").select("*");
  if (error) throw error;

  const backupPath = resolve(__dirname, "../backup_receitas.json");
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Backup criado em: ${backupPath}`);
}

// 🔹 Atualiza ingredientes normalizados no Supabase
async function applyNormalization() {
  try {
    await backupReceitas();

    const { data: receitas, error } = await supabase.from("receitas").select("*");
    if (error) throw error;
    if (!receitas || receitas.length === 0) throw new Error("Nenhuma receita encontrada.");

    for (const receita of receitas as Receita[]) {
      const normalized = receita.ingredientes.map(normalizeIngredient);

      const { error: updateError } = await supabase
        .from("receitas")
        .update({ ingredientes: normalized })
        .eq("id", receita.id);

      if (updateError) console.error(`❌ Erro ao atualizar receita ${receita.id}:`, updateError);
      else console.log(`✅ Receita ${receita.id} atualizada com sucesso.`);
    }

    console.log("🎯 Normalização aplicada a todas as receitas.");
  } catch (err) {
    console.error("❌ Erro no Apply:", err);
  }
}

// 🔹 Executa o Apply
applyNormalization();
