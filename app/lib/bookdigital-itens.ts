import type { ItemBiblioteca } from "@/types/bookdigital";

const CHAVE_ITENS = "bookdigitalItens";

// ============================================================
// LISTAR TODOS OS ITENS
// ============================================================

export function listarItens(): ItemBiblioteca[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const dados = localStorage.getItem(CHAVE_ITENS);

    if (!dados) {
      return [];
    }

    return JSON.parse(dados) as ItemBiblioteca[];
  } catch (error) {
    console.error(
      "Erro ao carregar itens do BookDigital:",
      error
    );

    return [];
  }
}

// ============================================================
// SALVAR ITENS
// ============================================================

function salvarItens(itens: ItemBiblioteca[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CHAVE_ITENS,
    JSON.stringify(itens)
  );
}

// ============================================================
// LISTAR ITENS DE UM TEMA
// ============================================================

export function listarItensPorTema(
  temaId: string
): ItemBiblioteca[] {
  return listarItens().filter(
    (item) => item.temaId === temaId
  );
}

// ============================================================
// CRIAR ITEM
// ============================================================

export function criarItem(
  dados: Omit<
    ItemBiblioteca,
    "id" | "criadoEm" | "atualizadoEm"
  >
): ItemBiblioteca {
  const itens = listarItens();

  const agora = new Date().toISOString();

  const novoItem: ItemBiblioteca = {
    ...dados,
    id: crypto.randomUUID(),
    criadoEm: agora,
    atualizadoEm: agora,
  };

  salvarItens([...itens, novoItem]);

  return novoItem;
}

// ============================================================
// ATUALIZAR ITEM
// ============================================================

export function atualizarItem(
  itemId: string,
  alteracoes: Partial<
    Omit<ItemBiblioteca, "id" | "criadoEm">
  >
): ItemBiblioteca {
  const itens = listarItens();

  const itemEncontrado = itens.find(
    (item) => item.id === itemId
  );

  if (!itemEncontrado) {
    throw new Error(
      "Item da biblioteca não encontrado."
    );
  }

  const itemAtualizado: ItemBiblioteca = {
    ...itemEncontrado,
    ...alteracoes,
    atualizadoEm: new Date().toISOString(),
  };

  const itensAtualizados = itens.map((item) =>
    item.id === itemId
      ? itemAtualizado
      : item
  );

  salvarItens(itensAtualizados);

  return itemAtualizado;
}

// ============================================================
// MOVER ITEM PARA OUTRO TEMA
// ============================================================

export function moverItemParaTema(
  itemId: string,
  novoTemaId: string
): ItemBiblioteca {
  return atualizarItem(
    itemId,
    {
      temaId: novoTemaId,
    }
  );
}

// ============================================================
// REMOVER ITEM
// ============================================================

export function removerItem(
  itemId: string
) {
  const itens = listarItens();

  const restantes = itens.filter(
    (item) => item.id !== itemId
  );

  salvarItens(restantes);
}

// ============================================================
// FAVORITAR / DESFAVORITAR ITEM
// ============================================================

export function toggleFavoritoItem(
  itemId: string
): ItemBiblioteca {
  const itens = listarItens();

  const itemEncontrado = itens.find(
    (item) => item.id === itemId
  );

  if (!itemEncontrado) {
    throw new Error(
      "Item da biblioteca não encontrado."
    );
  }

  return atualizarItem(
    itemId,
    {
      favorito: !itemEncontrado.favorito,
    }
  );
}