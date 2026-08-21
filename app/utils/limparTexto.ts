export function limparTexto(texto: string = "") {
  return texto
    // remove CR do Windows
    .replace(/\r/g, "")

    // remove aspas escapadas
    .replace(/\\"/g, '"')

    // remove aspas especiais
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

    // remove aspas no começo/fim
    .replace(/^"+|"+$/g, "")

    // remove aspas isoladas em linhas
    .replace(/^["']|["']$/gm, "")

    // remove linhas vazias duplicadas
    .replace(/\n\s*\n/g, "\n")

    .trim();
}