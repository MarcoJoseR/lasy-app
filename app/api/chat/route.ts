import { NextResponse } from "next/server";
import { openai, DEFAULT_MODEL } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,            // 🔒 FORÇAMOS o modelo aqui
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400
    });

    return NextResponse.json({
      text: response.choices[0].message.content
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro inesperado" },
      { status: 500 }
    );
  }
}
