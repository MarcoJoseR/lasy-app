import type { ItemBiblioteca } from "@/types/bookdigital";

export interface FiltrosBookDigital {
  busca: string;
  somenteFavoritos: boolean;
  somenteComVideo: boolean;
  somenteComDocumentos: boolean;
  somenteComImagens: boolean;
}

export type OrdenacaoBookDigital =
  | "recentes"
  | "antigos"
  | "titulo";

export function filtrarItensBookDigital(
  itens: ItemBiblioteca[],
  filtros: FiltrosBookDigital
): ItemBiblioteca[] {
  const termoBusca =
    filtros.busca.trim().toLowerCase();

  return itens.filter((item) => {
    if (
      filtros.somenteFavoritos &&
      !item.favorito
    ) {
      return false;
    }

    if (
      filtros.somenteComVideo &&
      !item.video
    ) {
      return false;
    }

    if (
      filtros.somenteComDocumentos &&
      (!item.documentos ||
        item.documentos.length === 0)
    ) {
      return false;
    }

    if (
      filtros.somenteComImagens &&
      (item.quantidadeImagens ?? 0) === 0
    ) {
      return false;
    }

    if (!termoBusca) {
      return true;
    }

    const titulo =
      item.titulo.toLowerCase();

    const descricao =
      item.descricao?.toLowerCase() ?? "";

    const palavrasChave =
      item.palavrasChave
        .join(" ")
        .toLowerCase();

    return (
      titulo.includes(termoBusca) ||
      descricao.includes(termoBusca) ||
      palavrasChave.includes(termoBusca)
    );
  });
}

export function ordenarItensBookDigital(
  itens: ItemBiblioteca[],
  ordenacao: OrdenacaoBookDigital
): ItemBiblioteca[] {
  return [...itens].sort((a, b) => {
    if (ordenacao === "titulo") {
      return a.titulo.localeCompare(
        b.titulo,
        "pt-BR"
      );
    }

    const dataA =
      new Date(a.criadoEm).getTime();

    const dataB =
      new Date(b.criadoEm).getTime();

    if (ordenacao === "antigos") {
      return dataA - dataB;
    }

    return dataB - dataA;
  });
}