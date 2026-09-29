export function adicionarLinkNaLista(
  links: string[],
  limite = 5
): string[] {
  if (links.length >= limite) {
    return links;
  }

  return [...links, ""];
}

export function atualizarLinkNaLista(
  links: string[],
  indice: number,
  valor: string
): string[] {
  return links.map((link, i) =>
    i === indice ? valor : link
  );
}

export function removerLinkDaLista(
  links: string[],
  indice: number
): string[] {
  return links.filter(
    (_, i) => i !== indice
  );
}