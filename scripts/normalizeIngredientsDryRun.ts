type Receita = {
  id: number;
  nome: string;
  ingredientes: string[];
};

// Função de normalização simples (exemplo)
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()           // transforma tudo em minúsculas
    .normalize('NFD')        // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim();                 // remove espaços extras
}

// Função Dry Run
export function dryRunNormalize(receitas: Receita[]) {
  receitas.forEach(receita => {
    console.log(`\nReceita: ${receita.nome}`);
    console.log('Ingredientes originais:', receita.ingredientes);

    const normalized = receita.ingredientes.map(ing => normalizeIngredient(ing));
    console.log('Ingredientes normalizados:', normalized);
  });
}

// Exemplo de execução
const receitasSample: Receita[] = [
  {
    id: 1,
    nome: "Bolo de Chocolate",
    ingredientes: ["Farinha","Ovos","Chocolate","Açúcar","Manteiga"]
  },
  {
    id: 2,
    nome: "Panqueca",
    ingredientes: ["Farinha","Ovos","Leite","Sal","Açúcar"]
  }
];

// Executa Dry Run
dryRunNormalize(receitasSample);
