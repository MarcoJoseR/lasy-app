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

// Função Dry Run conectada ao Supabase
async function dryRunSupabase() {
  try {
    const res = await fetch("http://localhost:3000/api/listar-receitas");
    const data = await res.json();

    if (!data.success) {
      console.error("Erro ao buscar receitas:", data.error);
      return;
    }

    data.receitas.forEach((receita: Receita) => {
      console.log(`\nReceita: ${receita.nome}`);
      console.log("Ingredientes originais:", receita.ingredientes);

      const normalized = receita.ingredientes.map(normalizeIngredient);
      console.log("Ingredientes normalizados:", normalized);
    });
  } catch (err) {
    console.error("Erro ao conectar API:", err);
  }
}

// Executa o Dry Run
dryRunSupabase();
