const DB_NAME = "health-receitas-db";
const DB_VERSION = 3;

const STORE_CARROSSEL = "carrossel-imagens";
const STORE_PRINTS_RECEITA = "receita-prints";
const STORE_CAPAS_RECEITA = "receita-capas";

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requisicao = indexedDB.open(DB_NAME, DB_VERSION);

    requisicao.onupgradeneeded = () => {
  const banco = requisicao.result;

  if (!banco.objectStoreNames.contains(STORE_CARROSSEL)) {
    banco.createObjectStore(STORE_CARROSSEL);
  }

  if (!banco.objectStoreNames.contains(STORE_CAPAS_RECEITA)) {
    banco.createObjectStore(STORE_CAPAS_RECEITA);
  }

  if (!banco.objectStoreNames.contains(STORE_PRINTS_RECEITA)) {
    banco.createObjectStore(STORE_PRINTS_RECEITA);
  }
};

    requisicao.onsuccess = () => {
      resolve(requisicao.result);
    };

    requisicao.onerror = () => {
      reject(requisicao.error);
    };
  });
}

export async function salvarImagensCarrossel(
  receitaId: string,
  imagens: string[]
): Promise<void> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_CARROSSEL,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_CARROSSEL);

    store.put(imagens, receitaId);

    transacao.oncomplete = () => {
      banco.close();
      resolve();
    };

    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}

export async function obterImagensCarrossel(
  receitaId: string
): Promise<string[]> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_CARROSSEL,
      "readonly"
    );

    const store = transacao.objectStore(STORE_CARROSSEL);

    const requisicao = store.get(receitaId);

    requisicao.onsuccess = () => {
      banco.close();

      const resultado = requisicao.result;

      resolve(
        Array.isArray(resultado)
          ? resultado
          : []
      );
    };

    requisicao.onerror = () => {
      banco.close();
      reject(requisicao.error);
    };
  });
}

export async function removerImagensCarrossel(
  receitaId: string
): Promise<void> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_CARROSSEL,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_CARROSSEL);

    store.delete(receitaId);

    transacao.oncomplete = () => {
      banco.close();
      resolve();
    };

    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}

// ============================================================
// PRINTS DAS RECEITAS EM TEXTO
// ============================================================

export async function salvarPrintsReceita(
  receitaId: string,
  imagens: string[]
): Promise<void> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_PRINTS_RECEITA,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_PRINTS_RECEITA);

    store.put(imagens, receitaId);

    transacao.oncomplete = () => {
      banco.close();
      resolve();
    };

    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}

export async function obterPrintsReceita(
  receitaId: string
): Promise<string[]> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_PRINTS_RECEITA,
      "readonly"
    );

    const store = transacao.objectStore(STORE_PRINTS_RECEITA);

    const requisicao = store.get(receitaId);

    requisicao.onsuccess = () => {
      banco.close();

      const resultado = requisicao.result;

      resolve(
        Array.isArray(resultado)
          ? resultado
          : []
      );
    };

    requisicao.onerror = () => {
      banco.close();
      reject(requisicao.error);
    };
  });
}

export async function removerPrintsReceita(
  receitaId: string
): Promise<void> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_PRINTS_RECEITA,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_PRINTS_RECEITA);

    store.delete(receitaId);

    transacao.oncomplete = () => {
      banco.close();
      resolve();
    };

    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}

// ============================================================
// CAPAS DAS RECEITAS
// ============================================================

export async function salvarCapaReceita(
  receitaId: string,
  imagem: string
): Promise<void> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_CAPAS_RECEITA,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_CAPAS_RECEITA);

    store.put(imagem, receitaId);

    transacao.oncomplete = () => {
      banco.close();
      resolve();
    };

    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}

export async function obterCapaReceita(
  receitaId: string
): Promise<string> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_CAPAS_RECEITA,
      "readonly"
    );

    const store = transacao.objectStore(STORE_CAPAS_RECEITA);

    const requisicao = store.get(receitaId);

    requisicao.onsuccess = () => {
      banco.close();

      const resultado = requisicao.result;

      resolve(
        typeof resultado === "string"
          ? resultado
          : ""
      );
    };

    requisicao.onerror = () => {
      banco.close();
      reject(requisicao.error);
    };
  });
}

export async function removerCapaReceita(
  receitaId: string
): Promise<void> {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(
      STORE_CAPAS_RECEITA,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_CAPAS_RECEITA);

    store.delete(receitaId);

    transacao.oncomplete = () => {
      banco.close();
      resolve();
    };

    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}