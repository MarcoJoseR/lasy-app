import type { Tema } from "@/types/bookdigital";

const CHAVE_TEMAS = "bookdigitalTemas";
const LIMITE_TEMAS = 9;

// ============================================================
// LISTAR TEMAS
// ============================================================

export function listarTemas(): Tema[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const dados = localStorage.getItem(CHAVE_TEMAS);

    if (!dados) {
      return [];
    }

    const temas = JSON.parse(dados) as Tema[];

    return temas.sort((a, b) => a.ordem - b.ordem);
  } catch (error) {
    console.error("Erro ao carregar temas do BookDigital:", error);
    return [];
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

  const restantes = temas
    .filter((tema) => tema.id !== temaId)
    .map((tema, indice) => ({
      ...tema,
      ordem: indice + 1,
    }));

  salvarTemas(restantes);
}