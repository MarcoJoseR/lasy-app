import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const dados = await request.json();

    const pastaBackup = path.join(
      process.cwd(),
      "Back-up LocalStorage"
    );

    await fs.mkdir(pastaBackup, { recursive: true });

    const agora = new Date();

    const data =
      agora.getFullYear() +
      "-" +
      String(agora.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(agora.getDate()).padStart(2, "0");

    const hora = agora
      .toTimeString()
      .slice(0, 8)
      .replace(/:/g, "-");

    const nomeArquivo =
      `receitas-health-localstorage-${data}-${hora}.json`;

    const caminhoArquivo = path.join(
      pastaBackup,
      nomeArquivo
    );

    await fs.writeFile(
      caminhoArquivo,
      JSON.stringify(dados, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      sucesso: true,
      nomeArquivo,
      caminho: caminhoArquivo,
    });
  } catch (erro) {
    console.error(
      "Erro ao salvar backup completo do LocalStorage:",
      erro
    );

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          "Não foi possível salvar o backup completo.",
      },
      { status: 500 }
    );
  }
}