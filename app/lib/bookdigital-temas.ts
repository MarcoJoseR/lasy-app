import type { Tema } from "@/types/bookdigital";

import {
  listarItensPorTema,
} from "@/app/lib/bookdigital-itens";

const CHAVE_TEMAS = "bookdigitalTemas";
const LIMITE_TEMAS = 9;

// ============================================================
// LISTAR TEMAS
// ============================================================

export function listarTemas(): Tema[] {
  if (typeof window === "undefined") {
    return [];
  }

  const dados = localStorage.getItem(CHAVE_TEMAS);

  if (dados === null) {
    return [];
  }

  try {
    const temas: unknown = JSON.parse(dados);

    if (
      !Array.isArray(temas) ||
      !temas.every(
        (tema) =>
          tema !== null &&
          typeof tema === "object" &&
          !Array.isArray(tema) &&
          typeof tema.id === "string" &&
          typeof tema.nome === "string" &&
          typeof tema.ordem === "number"
      )
    ) {
      throw new Error("Dados dos Temas inválidos.");
    }

    return (temas as Tema[]).sort(
      (a, b) => a.ordem - b.ordem
    );
  } catch (error) {
    console.error(
      "Erro ao carregar Temas. Gravação bloqueada:",
      error
    );

    throw new Error(
      "Não foi possível recuperar os Temas. Nenhuma alteração foi realizada."
    );
  }
}


// ============================================================
// SALVAR TEMAS
// ============================================================

function salvarTemas(temas: Tema[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CHAVE_TEMAS,
    JSON.stringify(temas)
  );
}

// ============================================================
// CRIAR TEMA
// ============================================================

export function criarTema(nome: string): Tema {
  const temas = listarTemas();

  if (temas.length >= LIMITE_TEMAS) {
    throw new Error(
      "O BookDigital permite no máximo 9 temas."
    );
  }

  const nomeLimpo = nome.trim();

  if (!nomeLimpo) {
    throw new Error(
      "Informe um nome para o tema."
    );
  }

  const agora = new Date().toISOString();

  const novoTema: Tema = {
    id: crypto.randomUUID(),
    nome: nomeLimpo,
    ordem: temas.length + 1,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  salvarTemas([...temas, novoTema]);

  return novoTema;
}

// ============================================================
// RENOMEAR TEMA
// ============================================================

export function renomearTema(
  temaId: string,
  novoNome: string
): Tema {
  const temas = listarTemas();

  const nomeLimpo = novoNome.trim();

  if (!nomeLimpo) {
    throw new Error(
      "Informe um nome para o tema."
    );
  }

  const temaEncontrado = temas.find(
    (tema) => tema.id === temaId
  );

  if (!temaEncontrado) {
    throw new Error(
      "Tema não encontrado."
    );
  }

  const atualizadoEm = new Date().toISOString();

  const temasAtualizados = temas.map((tema) =>
    tema.id === temaId
      ? {
          ...tema,
          nome: nomeLimpo,
          atualizadoEm,
        }
      : tema
  );

  salvarTemas(temasAtualizados);

  return {
    ...temaEncontrado,
    nome: nomeLimpo,
    atualizadoEm,
  };
}

// ============================================================
// REMOVER TEMA
// ============================================================

export function removerTema(temaId: string) {
  const temas = listarTemas();

  const temaEncontrado = temas.find(
    (tema) => tema.id === temaId
  );

  if (!temaEncontrado) {
    throw new Error(
      "Tema não encontrado."
    );
  }

  const itensDoTema =
    listarItensPorTema(temaId);

  if (itensDoTema.length > 0) {
    throw new Error(
      `O tema "${temaEncontrado.nome}" possui ${
        itensDoTema.length
      } ${
        itensDoTema.length === 1
          ? "item"
          : "itens"
      }. Exclua ou mova ${
        itensDoTema.length === 1
          ? "o item"
          : "os itens"
      } para outro tema antes de apagar este tema.`
    );
  }

  const restantes = temas
    .filter((tema) => tema.id !== temaId)
    .map((tema, indice) => ({
      ...tema,
      ordem: indice + 1,
    }));

  salvarTemas(restantes);
}