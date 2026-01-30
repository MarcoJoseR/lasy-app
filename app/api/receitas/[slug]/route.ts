import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Blindagem contra chamadas inválidas
  if (!slug || slug === "undefined" || slug === "null") {
    return NextResponse.json(
      { error: "Slug inválido" },
      { status: 400 }
    );
  }

  // Placeholder temporário
  return NextResponse.json({
    message: "Rota slug ativa",
    slug,
  });
}
