import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type Receita = {
  id: number;
  nome: string;
  ingredientes: string[];
  categoria?: string;
  tempo?: string;
  imagem_url?: string;
};

// Função de normalização
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Corrigindo __dirname em ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para gerar CSV
async function generateCSV() {
  try {
    const res = await fetch("http://localhost:3000/api/listar-receitas");
    const data = await res.json();

    if (!data.success) {
      console.error("Erro ao buscar receitas:", data.error);
      return;
    }

    const rows: string[] = [];
    rows.push("Receita,Ingrediente_Original,Ingrediente_Normalizado");

    data.receitas.forEach((receita: Receita) => {
      receita.ingredientes.forEach(ing => {
        const normalized = normalizeIngredient(ing);
        const originalEscaped = `"${ing.replace(/"/g, '""')}"`;
        const normalizedEscaped = `"${normalized.replace(/"/g, '""')}"`;
        const nameEscaped = `"${receita.nome.replace(/"/g, '""')}"`;

        rows.push(`${nameEscaped},${originalEscaped},${normalizedEscaped}`);
      });
    });

    const filePath = path.join(__dirname, "receitas_normalizadas.csv");
    fs.writeFileSync(filePath, rows.join("\n"), "utf-8");
    console.log(`CSV gerado com sucesso em: ${filePath}`);
  } catch (err) {
    console.error("Erro ao gerar CSV:", err);
  }
}

generateCSV();
