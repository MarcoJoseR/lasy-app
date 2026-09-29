export function podeAdicionarImagens(
  quantidadeAtual: number,
  quantidadeNova: number,
  limite = 20
): boolean {
  return quantidadeAtual + quantidadeNova <= limite;
}

export function removerImagemDaLista(
  imagens: string[],
  indice: number
): string[] {
  return imagens.filter(
    (_, index) => index !== indice
  );
}

export function moverImagemNaLista(
  imagens: string[],
  indice: number,
  direcao: "esquerda" | "direita"
): string[] {
  const destino =
    direcao === "esquerda"
      ? indice - 1
      : indice + 1;

  if (
    destino < 0 ||
    destino >= imagens.length
  ) {
    return imagens;
  }

  const novas = [...imagens];

  [novas[indice], novas[destino]] = [
    novas[destino],
    novas[indice],
  ];

  return novas;
}