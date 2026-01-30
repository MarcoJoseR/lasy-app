export interface Receita {
  id: number;
  nome?: string;
  descricao?: string;
  ingredientes_text?: string;
  embedding?: number[] | null;
}
