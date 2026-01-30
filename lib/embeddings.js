// C:\supabase-app\lib\embeddings.js
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY não definida no .env");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gerarEmbedding(texto) {
  if (!texto) return null;
  try {
    const resp = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: texto,
    });
    return resp.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("Erro gerarEmbedding:", err);
    return null;
  }
}
