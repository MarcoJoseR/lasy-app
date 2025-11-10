import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { parse } from "json2csv";

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

// 🔹 Função principal
async function generateCSV() {
  try {
    const { data: receitas, error } = await supabase.from("receitas").select("*");
    if (error) throw error;
    if (!receitas || receitas.length === 0) throw new Error("Nenhuma receita encontrada.");

    // Converte array de ingredientes para string separada por vírgula
    const receitasForCSV = receitas.map(r => ({
      id: r.id,
      nome: r.nome,
      ingredientes: r.ingredientes.join(", "),
      categoria: r.categoria || "",
      tempo: r.tempo || "",
      imagem_url: r.imagem_url || ""
    }));

    const csv = parse(receitasForCSV);
    const outputPath = resolve(__dirname, "./receitas_normalizadas_final.csv");
    fs.writeFileSync(outputPath, csv, "utf-8");

    console.log(`✅ CSV gerado com sucesso em: ${outputPath}`);
  } catch (err) {
    console.error("❌ Erro ao gerar CSV:", err);
  }
}

// 🔹 Executa
generateCSV();
