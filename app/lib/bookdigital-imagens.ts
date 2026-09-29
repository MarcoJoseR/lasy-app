const DB_NAME = "bookdigital-db";
const DB_VERSION = 2;

const STORE_CAPAS = "capas-itens";
const STORE_IMAGENS = "imagens-itens";

// ============================================================
// ABRIR BANCO
// ============================================================

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requisicao = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    requisicao.onupgradeneeded = () => {
      const db = requisicao.result;

      if (!db.objectStoreNames.contains(STORE_CAPAS)) {
        db.createObjectStore(STORE_CAPAS);
      }

      if (!db.objectStoreNames.contains(STORE_IMAGENS)) {
        db.createObjectStore(STORE_IMAGENS);
      }
    };

    requisicao.onsuccess = () => {
      resolve(requisicao.result);
    };

    requisicao.onerror = () => {
      reject(
        requisicao.error ??
          new Error(
            "Não foi possível abrir o banco de imagens do BookDigital."
          )
      );
    };
  });
}

// ============================================================
// SALVAR IMAGEM DE CAPA
// ============================================================

export async function salvarImagemCapa(
  chave: string,
  imagem: string
): Promise<void> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_CAPAS,
      "readwrite"
    );

    const store =
      transacao.objectStore(STORE_CAPAS);

    store.put(imagem, chave);

    transacao.oncomplete = () => {
      db.close();
      resolve();
    };

    transacao.onerror = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "Não foi possível salvar a imagem de capa."
          )
      );
    };

    transacao.onabort = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "O salvamento da imagem de capa foi cancelado."
          )
      );
    };
  });
}

// ============================================================
// OBTER IMAGEM DE CAPA
// ============================================================

export async function obterImagemCapa(
  chave: string
): Promise<string | null> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_CAPAS,
      "readonly"
    );

    const store =
      transacao.objectStore(STORE_CAPAS);

    const requisicao = store.get(chave);

    requisicao.onsuccess = () => {
      db.close();

      resolve(
        typeof requisicao.result === "string"
          ? requisicao.result
          : null
      );
    };

    requisicao.onerror = () => {
      db.close();

      reject(
        requisicao.error ??
          new Error(
            "Não foi possível carregar a imagem de capa."
          )
      );
    };
  });
}

// ============================================================
// REMOVER IMAGEM DE CAPA
// ============================================================

export async function removerImagemCapa(
  chave: string
): Promise<void> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_CAPAS,
      "readwrite"
    );

    const store =
      transacao.objectStore(STORE_CAPAS);

    store.delete(chave);

    transacao.oncomplete = () => {
      db.close();
      resolve();
    };

    transacao.onerror = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "Não foi possível remover a imagem de capa."
          )
      );
    };

    transacao.onabort = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "A remoção da imagem de capa foi cancelada."
          )
      );
    };
  });
}

// ============================================================
// SALVAR IMAGENS DO ITEM
// ============================================================

export async function salvarImagensItem(
  chave: string,
  imagens: string[]
): Promise<void> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_IMAGENS,
      "readwrite"
    );

    const store =
      transacao.objectStore(STORE_IMAGENS);

    store.put(imagens, chave);

    transacao.oncomplete = () => {
      db.close();
      resolve();
    };

    transacao.onerror = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "Não foi possível salvar as imagens do item."
          )
      );
    };

    transacao.onabort = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "O salvamento das imagens foi cancelado."
          )
      );
    };
  });
}

// ============================================================
// OBTER IMAGENS DO ITEM
// ============================================================

export async function obterImagensItem(
  chave: string
): Promise<string[]> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_IMAGENS,
      "readonly"
    );

    const store =
      transacao.objectStore(STORE_IMAGENS);

    const requisicao = store.get(chave);

    requisicao.onsuccess = () => {
      db.close();

      resolve(
        Array.isArray(requisicao.result)
          ? requisicao.result
          : []
      );
    };

    requisicao.onerror = () => {
      db.close();

      reject(
        requisicao.error ??
          new Error(
            "Não foi possível carregar as imagens do item."
          )
      );
    };
  });
}

// ============================================================
// REMOVER IMAGENS DO ITEM
// ============================================================

export async function removerImagensItem(
  chave: string
): Promise<void> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_IMAGENS,
      "readwrite"
    );

    const store =
      transacao.objectStore(STORE_IMAGENS);

    store.delete(chave);

    transacao.oncomplete = () => {
      db.close();
      resolve();
    };

    transacao.onerror = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "Não foi possível remover as imagens do item."
          )
      );
    };

    transacao.onabort = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "A remoção das imagens foi cancelada."
          )
      );
    };
  });
}