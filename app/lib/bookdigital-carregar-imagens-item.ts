import { obterImagensItem } from "@/app/lib/bookdigital-imagens";

export async function carregarImagensItemParaEdicao(
  chaveImagens?: string
): Promise<string[]> {
  if (!chaveImagens) {
    return [];
  }

  try {
    return await obterImagensItem(
      chaveImagens
    );
  } catch (erro) {
    console.error(
      "Erro ao carregar imagens do item:",
      erro
    );

    return [];
  }
}