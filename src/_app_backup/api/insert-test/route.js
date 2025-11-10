import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Conexão com Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    // Suporta array ou objeto único
    const registros = Array.isArray(body) ? body : [body];

    // Validação
    for (let i = 0; i < registros.length; i++) {
      const { Name, Email, Phone } = registros[i];

      if (!Name) {
        return NextResponse.json({
          success: false,
          error: `Campo Name é obrigatório no registro ${i + 1}`
        });
      }

      if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
        return NextResponse.json({
          success: false,
          error: `Email inválido no registro ${i + 1}`
        });
      }
    }

    // Inserção no Supabase
    const { data, error } = await supabase
      .from("Tabela_1")
      .insert(registros)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

// GET opcional
export async function GET() {
  return NextResponse.json({ info: "Use POST para inserir dados. Aceita array de objetos ou objeto único." });
}

