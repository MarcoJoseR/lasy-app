export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Receita {
  id: string;
  nome: string;
  slug?: string;

  categoria: string;
  subCategoria?: string;

  ingredientes: string[];
  modoPreparo: string[];

  tempo?: string;
  porcoes?: string;

  imagem?: string;
  video?: string;

  tags?: string[];

  resumo?: string;
  origem?: string;

  nutricao?: NutritionInfo;

  favorito: boolean;

  tipo?: "oficial" | "pessoal" | "candidata";

  criadoEm?: string;
  atualizadoEm?: string;
}