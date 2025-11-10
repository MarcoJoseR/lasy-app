// src/app/api/importar-receitas/route.ts
import { NextResponse } from "next/server";

// Rota de debug: apenas ecoa e loga o corpo recebido
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("API DEBUG - Recebido payload:", JSON.stringify(payload, null, 2));
    return NextResponse.json({ receivedCount: Array.isArray(payload) ? payload.length : 0, payload }, { status: 200 });
  } catch (err: any) {
    console.error("API DEBUG - Erro ao parsear JSON:", err);
    return NextResponse.json({ error: "Erro ao parsear JSON no servidor", detalhe: err?.message }, { status: 500 });
  }
}
