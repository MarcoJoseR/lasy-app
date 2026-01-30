import "dotenv/config";
import { supabase } from "../lib/supabaseClient.js";
import { getSimilarRecipesEmbedding } from "../lib/getSimilarRecipesEmbedding.js"; // ensure JS/TS compatibility

(async () => {
  console.log("Updating recommendations for all recipes");
  const { data: receitas } = await supabase.from("receitas").select("id, descricao");
  if (!receitas) {
    console.log("No recipes found");
    return;
  }
  for (const r of receitas) {
    try {
      const similares = await getSimilarRecipesEmbedding(r.descricao, r.id, { match_threshold: 0.75, match_count: 6 });
      await supabase.from("receitas").update({ similares }).eq("id", r.id);
      console.log(`Updated recs for ${r.id}`);
    } catch (err) {
      console.error(`Error for ${r.id}`, err);
    }
  }
  console.log("Recommendations update finished");
})();
