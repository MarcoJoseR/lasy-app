// types/recipe.ts

export interface IngredientItem {
  name: string;          // Ex: "Farinha de trigo"
  quantity: string;      // Ex: "2 xícaras"
  optional?: boolean;    // Ex: true/false
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface RecipeData {
  id: number;
  titulo: string;
  slug: string;
  categoria: string;
  subcategoria?: string;

  // Ingredientes estruturados (jsonb)
  ingredientes: IngredientItem[];

  // Ingredientes em texto corrido (reduz tokens)
  ingredientes_text?: string;

  // Modo de preparo em texto
  preparo_text: string;

  // Campo adicional para SEO, IA, e buscas otimizadas
  resumo?: string;

  // Nutrição opcional
  nutricao?: NutritionInfo;

  // País/região da receita (Brasil, EUA, LatAm, Europa)
  origem?: string;

  // Imagem padrão
  imagem_url?: string;

  // Controle de datas
  criado_em?: string;
  atualizado_em?: string;
}
