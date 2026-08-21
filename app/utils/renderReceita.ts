export function formatarIngredientes(
  ingredientes: string[] | string | undefined
): string[] {
  if (!ingredientes) return [];

  // se vier array
  if (Array.isArray(ingredientes)) {
    return ingredientes
      .map((i) => limparLinha(i))
      .filter((i) => i !== "");
  }

  // se vier texto
  return ingredientes
    .split(/\n+/)
    .map((i) => limparLinha(i))
    .filter((i) => i !== "");
}

export function formatarModoPreparo(
  modoPreparo: string[] | string | undefined
) {
  if (!modoPreparo) {
    return {
      tipo: "texto",
      itens: [],
    };
  }

  // transforma array em texto único
  const texto = Array.isArray(modoPreparo)
    ? modoPreparo.join("\n")
    : modoPreparo;

  const linhas = texto
    .split(/\n+/)
    .map((l) => limparLinha(l))
    .filter((l) => l !== "");

  // verifica se parece lista numerada
  const numerado = linhas.every((linha) =>
    /^\d+\s*[-.)]/.test(linha)
  );

  if (numerado) {
    return {
      tipo: "numerado",
      itens: linhas.map((linha) =>
        linha.replace(/^\d+\s*[-.)]\s*/, "")
      ),
    };
  }

  // multiline comum
  if (linhas.length > 1) {
    return {
      tipo: "lista",
      itens: linhas,
    };
  }

  // texto simples
  return {
    tipo: "texto",
    itens: linhas,
  };
}

function limparLinha(texto: string) {
  return texto
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}