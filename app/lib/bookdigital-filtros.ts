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

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarItensBookDigital(
  itens: ItemBiblioteca[],
  filtros: FiltrosBookDigital
): ItemBiblioteca[] {
  const termoBusca =
  normalizarTexto(filtros.busca.trim());

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
      normalizarTexto(item.titulo);

    const descricao =
      normalizarTexto(item.descricao ?? "");

    const palavrasChave =
      normalizarTexto(
        item.palavrasChave.join(" ")
      );

    const textoPesquisavel = [
      titulo,
      descricao,
      palavrasChave,
      normalizarTexto(item.origem ?? ""),
      normalizarTexto(
        (item.documentos ?? [])
          .map((documento) => documento.nomeDocumento)
          .join(" ")
      ),
    ].join(" ");

    const termos = termoBusca
    .split(/[\s,;]+/)
    .filter(Boolean);

    return termos.every((termo) =>
      textoPesquisavel.includes(termo)
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