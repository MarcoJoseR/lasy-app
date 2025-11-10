import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      success: false,
      error: "Variáveis de ambiente não carregadas",
    });
  }

  const supabase = createClient(url, key);

  // Teste simples: listar as tabelas existentes
  const { data, error } = await supabase.from("test_connection").select("*");

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json({
    success: true,
    data,
  });
}
