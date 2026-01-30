import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAdvancedRecommendations(receitaId: number, usuarioId?: number, limit = 5) {
  // Buscar a receita atual
  const { data: receita } = await supabase
    .from("receitas")
    .select("*")
    .eq("id", receitaId)
    .single();
  if (!receita) return [];

  // Buscar histórico do usuário (favoritos e visualizações)
  let preferencias: string[] = [];
  if (usuarioId) {
    const { data: interacoes } = await supabase
      .from("interacoes")
      .select("receita_id")
      .eq("usuario_id", usuarioId);
    if (interacoes) preferencias = interacoes.map((i) => i.receita_id.toString());
  }

  // Similaridade por embedding (ingredientes_text)
  const { data: similares } = await supabase.rpc("match_recipes", {
    target_embedding: receita.embedding_vector,
    limit_count: limit + 1
  });

  // Filtra a própria receita e preferências já vistas
  const recomendadas = (similares || [])
    .filter((r: any) => r.id !== receitaId && !preferencias.includes(r.id.toString()))
    .slice(0, limit);

  return recomendadas;
}
