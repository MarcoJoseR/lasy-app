import {
  restaurarMinhaBiblioteca,
} from "@/app/utils/importarMinhaBiblioteca";

import {
  salvarImagemCapa,
  salvarImagensItem,
} from "@/app/lib/bookdigital-imagens";

import {
  salvarDocumento,
} from "@/app/lib/bookdigital-arquivos";

type DocumentoBackup = {
  nomeDocumento: string;
  tipoDocumento?: string;
  conteudo: string;
};

type BackupGeralAppV1 = {
  app: "Health";
  tipo: "backup-geral-app";
  versaoBackup: 1;
  exportadoEm: string;

  dados: {
    health: {
      receitas: unknown[];
      listasCompras: unknown[];

      carrosseisIndexedDB?: Record<
        string,
        string[]
      >;

      printsIndexedDB?: Record<
        string,
        string[]
      >;

      capasIndexedDB?: Record<
        string,
        string
      >;
    };

    bookdigital: {
      temas: unknown[];
      itens: unknown[];

      capasIndexedDB?: Record<
        string,
        string
      >;

      imagensIndexedDB?: Record<
        string,
        string[]
      >;

      documentosIndexedDB?: Record<
        string,
        DocumentoBackup
      >;
    };
  };
};

export type ResultadoValidacaoBackupApp = {
  valido: boolean;
  mensagem: string;

  health: {
    receitas: number;
    listas: number;
    carrosseis: number;
    prints: number;
    capas: number;
  };

  bookdigital: {
    temas: number;
    itens: number;
    capas: number;
    imagens: number;
    documentos: number;
  };

  backup?: BackupGeralAppV1;
};

// ============================================================
// CONVERTER DATA URL PARA BLOB
// ============================================================

function dataURLParaBlob(
  dataURL: string
): Blob {
  const partes =
    dataURL.split(",");

  if (partes.length !== 2) {
    throw new Error(
      "Documento em formato inválido."
    );
  }

  const cabecalho =
    partes[0];

  const base64 =
    partes[1];

  const tipoEncontrado =
    cabecalho.match(
      /data:(.*?);base64/
    );

  const tipo =
    tipoEncontrado?.[1] ||
    "application/octet-stream";

  const binario =
    atob(base64);

  const bytes =
    new Uint8Array(
      binario.length
    );

  for (
    let i = 0;
    i < binario.length;
    i++
  ) {
    bytes[i] =
      binario.charCodeAt(i);
  }

  return new Blob(
    [bytes],
    {
      type: tipo,
    }
  );
}

// ============================================================
// VALIDAR BACKUP GERAL
// ============================================================

export async function validarBackupApp(
  arquivo: File
): Promise<ResultadoValidacaoBackupApp> {
  try {
    const texto =
      await arquivo.text();

    const dados =
      JSON.parse(texto);

    if (
      dados?.app !== "Health" ||
      dados?.tipo !== "backup-geral-app" ||
      dados?.versaoBackup !== 1
    ) {
      return {
        valido: false,
        mensagem:
          "O arquivo não é um backup geral válido do aplicativo.",

        health: {
          receitas: 0,
          listas: 0,
          carrosseis: 0,
          prints: 0,
          capas: 0,
        },

        bookdigital: {
          temas: 0,
          itens: 0,
          capas: 0,
          imagens: 0,
          documentos: 0,
        },
      };
    }

    const health =
      dados?.dados?.health;

    const bookdigital =
      dados?.dados?.bookdigital;

    if (
      !health ||
      !bookdigital ||
      !Array.isArray(
        health.receitas
      ) ||
      !Array.isArray(
        health.listasCompras
      ) ||
      !Array.isArray(
        bookdigital.temas
      ) ||
      !Array.isArray(
        bookdigital.itens
      )
    ) {
      return {
        valido: false,
        mensagem:
          "O backup geral está incompleto ou possui estrutura inválida.",

        health: {
          receitas: 0,
          listas: 0,
          carrosseis: 0,
          prints: 0,
          capas: 0,
        },

        bookdigital: {
          temas: 0,
          itens: 0,
          capas: 0,
          imagens: 0,
          documentos: 0,
        },
      };
    }

    return {
      valido: true,
      mensagem:
        "Backup geral válido.",

      health: {
        receitas:
          health.receitas.length,

        listas:
          health.listasCompras.length,

        carrosseis:
          health
            .carrosseisIndexedDB &&
          typeof health
            .carrosseisIndexedDB ===
            "object"
            ? Object.keys(
                health
                  .carrosseisIndexedDB
              ).length
            : 0,

        prints:
          health.printsIndexedDB &&
          typeof health
            .printsIndexedDB ===
            "object"
            ? Object.keys(
                health
                  .printsIndexedDB
              ).length
            : 0,

        capas:
          health.capasIndexedDB &&
          typeof health
            .capasIndexedDB ===
            "object"
            ? Object.keys(
                health
                  .capasIndexedDB
              ).length
            : 0,
      },

      bookdigital: {
        temas:
          bookdigital.temas.length,

        itens:
          bookdigital.itens.length,

        capas:
          bookdigital
            .capasIndexedDB &&
          typeof bookdigital
            .capasIndexedDB ===
            "object"
            ? Object.keys(
                bookdigital
                  .capasIndexedDB
              ).length
            : 0,

        imagens:
          bookdigital
            .imagensIndexedDB &&
          typeof bookdigital
            .imagensIndexedDB ===
            "object"
            ? Object.keys(
                bookdigital
                  .imagensIndexedDB
              ).length
            : 0,

        documentos:
          bookdigital
            .documentosIndexedDB &&
          typeof bookdigital
            .documentosIndexedDB ===
            "object"
            ? Object.keys(
                bookdigital
                  .documentosIndexedDB
              ).length
            : 0,
      },

      backup:
        dados as BackupGeralAppV1,
    };
  } catch (erro) {
    console.error(
      "Erro ao validar backup geral:",
      erro
    );

    return {
      valido: false,
      mensagem:
        "Não foi possível ler o arquivo de backup geral.",

      health: {
        receitas: 0,
        listas: 0,
        carrosseis: 0,
        prints: 0,
        capas: 0,
      },

      bookdigital: {
        temas: 0,
        itens: 0,
        capas: 0,
        imagens: 0,
        documentos: 0,
      },
    };
  }
}

// ============================================================
// RESTAURAR BACKUP GERAL
// ============================================================

export async function restaurarBackupApp(
  backup: BackupGeralAppV1
) {
  try {
    // ============================================================
    // 1. RESTAURA HEALTH
    // ============================================================

    const resultadoHealth =
      await restaurarMinhaBiblioteca({
        dados: {
          receitas:
            backup.dados.health
              .receitas,

          listasCompras:
            backup.dados.health
              .listasCompras,

          carrosseisIndexedDB:
            backup.dados.health
              .carrosseisIndexedDB,

          printsIndexedDB:
            backup.dados.health
              .printsIndexedDB,

          capasIndexedDB:
            backup.dados.health
              .capasIndexedDB,
        },
      });

    if (!resultadoHealth.sucesso) {
      return {
        sucesso: false,
        mensagem:
          "Não foi possível restaurar os dados do Health.",
      };
    }

    // ============================================================
    // 2. RESTAURA LOCALSTORAGE DO BOOKDIGITAL
    // ============================================================

    localStorage.setItem(
      "bookdigitalTemas",
      JSON.stringify(
        backup.dados.bookdigital
          .temas
      )
    );

    localStorage.setItem(
      "bookdigitalItens",
      JSON.stringify(
        backup.dados.bookdigital
          .itens
      )
    );

    // ============================================================
    // 3. RESTAURA CAPAS DO BOOKDIGITAL
    // ============================================================

    const capas =
      backup.dados.bookdigital
        .capasIndexedDB || {};

    for (
      const [chave, imagem]
      of Object.entries(capas)
    ) {
      if (
        typeof imagem !==
          "string" ||
        !imagem.startsWith(
          "data:image/"
        )
      ) {
        continue;
      }

      await salvarImagemCapa(
        chave,
        imagem
      );
    }

    // ============================================================
    // 4. RESTAURA IMAGENS DOS ITENS
    // ============================================================

    const imagens =
      backup.dados.bookdigital
        .imagensIndexedDB || {};

    for (
      const [chave, lista]
      of Object.entries(imagens)
    ) {
      if (
        !Array.isArray(lista)
      ) {
        continue;
      }

      await salvarImagensItem(
        chave,
        lista
      );
    }

    // ============================================================
    // 5. RESTAURA DOCUMENTOS
    // ============================================================

    const documentos =
      backup.dados.bookdigital
        .documentosIndexedDB || {};

    for (
      const [
        chave,
        documento,
      ] of Object.entries(
        documentos
      )
    ) {
      if (
        !documento ||
        typeof documento.conteudo !==
          "string" ||
        !documento.conteudo.startsWith(
          "data:"
        )
      ) {
        continue;
      }

      const blob =
        dataURLParaBlob(
          documento.conteudo
        );

      await salvarDocumento(
        chave,
        blob
      );
    }

    return {
      sucesso: true,
      mensagem:
        "Backup geral restaurado com sucesso.",
    };
  } catch (erro) {
    console.error(
      "Erro ao restaurar backup geral:",
      erro
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível restaurar o backup geral.",
    };
  }
}