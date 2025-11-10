// pages/api/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // chave do servidor
});

export default async function handler(req, res) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Olá" }],
  });
  res.status(200).json({ result: response.choices[0].message });
}
