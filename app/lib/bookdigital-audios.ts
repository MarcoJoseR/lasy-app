
import { abrirBanco } from "./bookdigital-arquivos";

const STORE_AUDIOS = "audios-itens";

// ============================================================
// SALVAR ÁUDIO
// ============================================================

export async function salvarAudio(
  chave: string,
  arquivo: Blob
): Promise<void> {
  const db = await abrirBanco();

  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = db.transaction(
        STORE_AUDIOS,
        "readwrite"
      );

      const store = transacao.objectStore(
        STORE_AUDIOS
      );

      store.put(arquivo, chave);

      transacao.oncomplete = () => {
        resolve();
      };

      transacao.onerror = () => {
        reject(
          transacao.error ??
            new Error("Não foi possível salvar o áudio.")
        );
      };

      transacao.onabort = () => {
        reject(
          transacao.error ??
            new Error("O salvamento do áudio foi cancelado.")
        );
      };
    });
  } finally {
    db.close();
  }
}

// ============================================================
// OBTER ÁUDIO
// ============================================================

export async function obterAudio(
  chave: string
): Promise<Blob | null> {
  const db = await abrirBanco();

  try {
    return await new Promise<Blob | null>(
      (resolve, reject) => {
        const transacao = db.transaction(
          STORE_AUDIOS,
          "readonly"
        );

        const store = transacao.objectStore(
          STORE_AUDIOS
        );

        const requisicao = store.get(chave);

        let resultado: Blob | null = null;

        requisicao.onsuccess = () => {
          resultado =
            requisicao.result instanceof Blob
              ? requisicao.result
              : null;
        };

        transacao.oncomplete = () => {
          resolve(resultado);
        };

        transacao.onerror = () => {
          reject(
            transacao.error ??
              new Error("Não foi possível carregar o áudio.")
          );
        };

        transacao.onabort = () => {
          reject(
            transacao.error ??
              new Error("A leitura do áudio foi cancelada.")
          );
        };
      }
    );
  } finally {
    db.close();
  }
}

// ============================================================
// REMOVER ÁUDIO
// ============================================================

export async function removerAudio(
  chave: string
): Promise<void> {
  const db = await abrirBanco();

  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = db.transaction(
        STORE_AUDIOS,
        "readwrite"
      );

      const store = transacao.objectStore(
        STORE_AUDIOS
      );

      store.delete(chave);

      transacao.oncomplete = () => {
        resolve();
      };

      transacao.onerror = () => {
        reject(
          transacao.error ??
            new Error("Não foi possível remover o áudio.")
        );
      };

      transacao.onabort = () => {
        reject(
          transacao.error ??
            new Error("A exclusão do áudio foi cancelada.")
        );
      };
    });
  } finally {
    db.close();
  }
}
