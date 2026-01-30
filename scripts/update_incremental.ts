import "dotenv/config";
import { updateEmbeddings } from "../lib/embeddings/pipeline.js";

(async () => {
  console.log("Running incremental update");
  await updateEmbeddings({ mode: "incremental" });
})();
