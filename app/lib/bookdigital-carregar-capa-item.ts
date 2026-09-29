import type { ItemBiblioteca } from "@/types/bookdigital";

export function carregarCapaItemParaEdicao(
  item: ItemBiblioteca,
  capas: Record<string, string>
) {
  return {
    imagemCapaAtual:
      capas[item.id] ?? "",
    posicaoImagemY:
      item.posicaoImagemY ?? 50,
  };
}