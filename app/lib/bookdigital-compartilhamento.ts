// =============================================
// BAÚDIGITAL — ÚLTIMA PREPARAÇÃO
// Compartilhar Item — Versão 1.0
// =============================================

export interface UltimaPreparacaoCompartilhamento {
  descricao: string;
  imagensSelecionadas: string[];
  documentosSelecionados: string[];
  audiosSelecionados: string[];
  linksSelecionados: string[];
  atualizadoEm: string;
}

const CHAVE_ARMAZENAMENTO =
  "bookdigitalUltimasSelecoes";

// =============================================
// SALVAR ÚLTIMA PREPARAÇÃO DO ITEM
// =============================================

export function salvarUltimaPreparacao(
  itemId: string,
  preparacao: UltimaPreparacaoCompartilhamento
): void {
  try {
    const dados = localStorage.getItem(
      CHAVE_ARMAZENAMENTO
    );

    const preparacoes = dados
      ? JSON.parse(dados)
      : {};

    preparacoes[itemId] = preparacao;

    localStorage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify(preparacoes)
    );
    } catch (erro) {
    console.error(
      "Erro ao salvar última preparação:",
      erro
    );

    throw erro;
  }
}

// =============================================
// RECUPERAR ÚLTIMA PREPARAÇÃO DO ITEM
// =============================================

export function obterUltimaPreparacao(
  itemId: string
): UltimaPreparacaoCompartilhamento | null {
  try {
    const dados = localStorage.getItem(
      CHAVE_ARMAZENAMENTO
    );

    if (!dados) return null;

    const preparacoes = JSON.parse(dados);

    return preparacoes[itemId] || null;
  } catch (erro) {
    console.error(
      "Erro ao recuperar última preparação:",
      erro
    );

    return null;
  }
}

// =============================================
// IDENTIFICAR IMAGEM PELO CONTEÚDO
// =============================================

export async function identificarImagem(
  imagem: string
): Promise<string> {
  const dados = new TextEncoder().encode(imagem);

  const resumo = await crypto.subtle.digest(
    "SHA-256",
    dados
  );

  return Array.from(new Uint8Array(resumo))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}