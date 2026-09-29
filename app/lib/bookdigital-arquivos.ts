const DB_NAME = "bookdigital-arquivos-db";
const DB_VERSION = 1;
const STORE_DOCUMENTOS = "documentos-itens";

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

      if (
        !db.objectStoreNames.contains(
          STORE_DOCUMENTOS
        )
      ) {
        db.createObjectStore(
          STORE_DOCUMENTOS
        );
      }
    };

    requisicao.onsuccess = () => {
      resolve(requisicao.result);
    };

    requisicao.onerror = () => {
      reject(
        requisicao.error ??
          new Error(
            "Não foi possível abrir o banco de documentos do BookDigital."
          )
      );
    };
  });
}

// ============================================================
// SALVAR DOCUMENTO
// ============================================================

export async function salvarDocumento(
  chave: string,
  arquivo: Blob
): Promise<void> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_DOCUMENTOS,
      "readwrite"
    );

    const store =
      transacao.objectStore(
        STORE_DOCUMENTOS
      );

    store.put(arquivo, chave);

    transacao.oncomplete = () => {
      db.close();
      resolve();
    };

    transacao.onerror = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "Não foi possível salvar o documento."
          )
      );
    };

    transacao.onabort = () => {
      db.close();

      reject(
        transacao.error ??
          new Error(
            "O salvamento do documento foi cancelado."
          )
      );
    };
  });
}

// ============================================================
// OBTER DOCUMENTO
// ============================================================

export async function obterDocumento(
  chave: string
): Promise<Blob | null> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_DOCUMENTOS,
      "readonly"
    );

    const store =
      transacao.objectStore(
        STORE_DOCUMENTOS
      );

    const requisicao = store.get(chave);

    requisicao.onsuccess = () => {
      db.close();

      resolve(
        requisicao.result instanceof Blob
          ? requisicao.result
          : null
      );
    };

    requisicao.onerror = () => {
      db.close();

      reject(
        requisicao.error ??
          new Error(
            "Não foi possível carregar o documento."
          )
      );
    };
  });
}

// ============================================================
// REMOVER DOCUMENTO
// ============================================================

export async function removerDocumento(
  chave: string
): Promise<void> {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(
      STORE_DOCUMENTOS,
      "readwrite"
    );

    const store =
      transacao.objectStore(
        STORE_DOCUMENTOS
      );

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
            "Não foi possível remover o documento."
          )
      );
    };
  });
}