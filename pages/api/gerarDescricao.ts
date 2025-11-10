// pages/api/gerarDescricao.ts

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    const { titulo, categoria, ingredientes } = req.body;

    if (!titulo || !categoria || !ingredientes) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    const prompt = `
Gere uma descrição curta, atraente e natural para uma receita de ${titulo}, 
pertencente à categoria ${categoria}. 
Use um tom culinário leve e saboroso, ressaltando os ingredientes principais: ${ingredientes}.
Texto em português, máximo 3 linhas.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um assistente especializado em culinária e escrita criativa." },
        { role: "user", content: prompt },
      ],
    });

    const descricao = completion.choices[0].message?.content || "Não foi possível gerar descrição.";

    return res.status(200).json({ descricao });
  } catch (error: any) {
    console.error("Erro ao gerar descrição:", error);
    return res.status(500).json({ error: "Erro interno ao gerar descrição." });
  }
}
