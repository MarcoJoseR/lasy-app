import pLimit from "p-limit";
import { generateEmbedding, updateEmbeddingForRecipe } from "./embeddings";
import { getPendingRecipes, getAllRecipesBatch } from "./storage";
import type { Receita } from "./types";

const CONCURRENCY = Number(process.env.CONCURRENCY || 6);

export async function updateEmbeddings(options?: { mode?: "incremental" | "full"; batchSize?: number }) {
  const mode = options?.mode || "incremental";
  const batchSize = options?.batchSize ?? Number(process.env.DEFAULT_BATCH_SIZE || 100);
  console.log(`Starting embeddings pipeline (mode=${mode}, batchSize=${batchSize})`);

  if (mode === "incremental") {
    const pending = await getPendingRecipes(batchSize);
    await processRecipes(pending, CONCURRENCY);
  } else {
    // full mode: iterate in batches with offset
    let offset = 0;
    while (true) {
      const batch = await getAllRecipesBatch(batchSize, offset);
      if (!batch || batch.length === 0) break;
      await processRecipes(batch, CONCURRENCY);
      offset += batch.length;
    }
  }
  console.log("Pipeline finished.");
}

async function processRecipes(recipes: Receita[], concurrency: number) {
  if (!recipes || recipes.length === 0) {
    console.log("No recipes to process.");
    return;
  }
  const limit = pLimit(concurrency);
  await Promise.all(
    recipes.map((r) =>
      limit(async () => {
        try {
          const text = r.ingredientes_text || r.descricao || "";
          if (!text) {
            console.log(`Skipping ${r.id} (no text)`);
            return;
          }
          const embedding = await generateEmbedding(text);
          if (!embedding) {
            console.warn(`No embedding generated for ${r.id}`);
            return;
          }
          const ok = await updateEmbeddingForRecipe(r.id, embedding);
          if (ok) console.log(`Updated embedding for ${r.id}`);
        } catch (err) {
          console.error(`Error processing recipe ${r.id}:`, err);
        }
      })
    )
  );
}
