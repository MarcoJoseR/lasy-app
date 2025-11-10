// pages/api/sugestoes-gpt.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Defina a chave no .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { ingredientes } = req.body;

  if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
    return res.status(400).json({ message: "Ingredientes não fornecidos" });
  }

  try {
    const prompt = `
      Sugira 5 receitas diferentes com base nos seguintes ingredientes: ${ingredientes.join(
        ", "
      )}.
      Para cada receita, forneça: nome e uma breve descrição de no máximo 50 caracteres.
      Retorne apenas um array JSON com objetos: { "nome": "...", "descricao": "..." }.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices[0].message?.content || "[]";
    
    // Tenta converter para JSON
    let sugestoes;
    try {
      sugestoes = JSON.parse(text);
    } catch {
      sugestoes = [];
    }

    res.status(200).json(sugestoes);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Erro ao gerar sugestões GPT" });
  }
}
