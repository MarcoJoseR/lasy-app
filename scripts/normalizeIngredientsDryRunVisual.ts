import fetch from "node-fetch";

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

// Função para gerar tabela visual no console
async function dryRunVisual() {
  try {
    const res = await fetch("http://localhost:3000/api/listar-receitas");
    const data = await res.json();

    if (!data.success) {
      console.error("Erro ao buscar receitas:", data.error);
      return;
    }

    console.log("=== Tabela Visual de Normalização de Ingredientes ===\n");

    data.receitas.forEach((receita: Receita) => {
      console.log(`Receita: ${receita.nome}`);
      console.log("Originais -> Normalizados");

      receita.ingredientes.forEach(ing => {
        const normalized = normalizeIngredient(ing);
        console.log(`${ing} -> ${normalized}`);
      });

      console.log("\n---------------------------------------------\n");
    });
  } catch (err) {
    console.error("Erro ao conectar API:", err);
  }
}

// Executa o Dry Run Visual
dryRunVisual();
