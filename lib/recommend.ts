import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getRecommendedRecipes(receitaId: number, limit = 5) {
  // Buscar a receita atual
  const { data: receita } = await supabase
    .from("receitas")
    .select("*")
    .eq("id", receitaId)
    .single();

  if (!receita) return [];

  // Buscar receitas da mesma categoria/subcategoria (excluindo a atual)
  const { data: similares } = await supabase
    .from("receitas")
    .select("*")
    .eq("categoria", receita.categoria)
    .neq("id", receitaId)
    .limit(limit);

  return similares || [];
}
