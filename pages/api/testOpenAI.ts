// pages/api/testOpenAI.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: "Teste de integração bem-sucedido com a API da OpenAI.",
    });
    res.status(200).json({ ok: true, message: response.output[0].content[0].text });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
