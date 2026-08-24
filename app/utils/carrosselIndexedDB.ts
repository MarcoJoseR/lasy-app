const DB_NAME = "health-receitas-db";
const DB_VERSION = 1;

const STORE_CARROSSEL = "carrossel-imagens";

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requisicao = indexedDB.open(DB_NAME, DB_VERSION);

    requisicao.onupgradeneeded = () => {
      const banco = requisicao.result;

      if (!banco.objectStoreNames.contains(STORE_CARROSSEL)) {
        banco.createObjectStore(STORE_CARROSSEL);
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