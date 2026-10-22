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

import {
  salvarAudio,
} from "@/app/lib/bookdigital-audios";

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

  pendencias?: {
    modulo: "Health" | "BaúDigital";
    nome: string;
    problema: string;
  }[];

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
      audiosIndexedDB?: Record<string, string>;
    };
    
    linksPendentes?: {
      id: string;
      titulo: string;
      url: string;
      criadoEm: string;
      status: "pendente";
    }[];
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
  
  linksPendentes?: number;

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
// VERIFICAR INTEGRIDADE DOS ANEXOS DO BACKUP
// ============================================================

function verificarIntegridadeBackup(
  backup: BackupGeralAppV1
): string | null {
  const health = backup.dados.health;

  const imagemValida = (valor: unknown): boolean =>
    typeof valor === "string" &&
    /^data:image\/[^,]+;base64,/.test(valor);

  for (const entrada of health.receitas) {
    if (
      !entrada ||
      typeof entrada !== "object"
    ) {
      return "O backup contém uma receita inválida.";
    }

    const receita = entrada as {
      nome?: string;
      tipoConteudo?: string;
      carrossel?: {
        chaveImagens?: string;
        quantidadeImagens?: number;
      };
      chavePrintsLegenda?: string;
      quantidadePrintsLegenda?: number;
      chaveImagemCapa?: string;
    };

    const nome = receita.nome || "Receita sem nome";

    if (receita.tipoConteudo === "carrossel") {
      const chave = receita.carrossel?.chaveImagens;
      const imagens = chave
        ? health.carrosseisIndexedDB?.[chave]
        : undefined;

      if (
        !chave ||
        !Array.isArray(imagens) ||
        imagens.length === 0 ||
        !imagens.every(imagemValida) ||
        (
          typeof receita.carrossel?.quantidadeImagens ===
            "number" &&
          receita.carrossel.quantidadeImagens > 0 &&
          imagens.length !==
            receita.carrossel.quantidadeImagens
        )
      ) {
        return `Carrossel ausente ou inválido: ${nome}`;
      }
    }

    if (receita.chavePrintsLegenda) {
      const prints =
        health.printsIndexedDB?.[
          receita.chavePrintsLegenda
        ];

      if (
        !Array.isArray(prints) ||
        prints.length === 0 ||
        !prints.every(imagemValida) ||
        (
          typeof receita.quantidadePrintsLegenda ===
            "number" &&
          receita.quantidadePrintsLegenda > 0 &&
          prints.length !==
            receita.quantidadePrintsLegenda
        )
      ) {
        return `Prints ausentes ou inválidos: ${nome}`;
      }
    } else if (
      typeof receita.quantidadePrintsLegenda ===
        "number" &&
      receita.quantidadePrintsLegenda > 0
    ) {
      return `Prints sem referência: ${nome}`;
    }

    if (receita.chaveImagemCapa) {
      const capa =
        health.capasIndexedDB?.[
          receita.chaveImagemCapa
        ];

      if (!imagemValida(capa)) {
        return `Capa ausente ou inválida: ${nome}`;
      }
    }
  }

  const bau = backup.dados.bookdigital;

  for (const entrada of bau.itens) {
    if (!entrada || typeof entrada !== "object") {
      return "O backup contém um item inválido do BaúDigital.";
    }

    const item = entrada as {
      titulo?: string;
      chaveImagemCapa?: string;
      chaveImagens?: string;
      quantidadeImagens?: number;
      documentos?: {
        chaveDocumento?: string;
        nomeDocumento?: string;
      }[];
    };

    const nome = item.titulo || "Item sem título";

    // CAPA
    if (item.chaveImagemCapa) {
      const capa =
        bau.capasIndexedDB?.[item.chaveImagemCapa];

      if (!imagemValida(capa)) {
        return `Capa ausente ou inválida no BaúDigital: ${nome}`;
      }
    }

    // IMAGENS
    if (item.chaveImagens) {
      const imagens =
        bau.imagensIndexedDB?.[item.chaveImagens];

      if (
        !Array.isArray(imagens) ||
        imagens.length === 0 ||
        !imagens.every(imagemValida) ||
        (
          typeof item.quantidadeImagens === "number" &&
          item.quantidadeImagens > 0 &&
          imagens.length !== item.quantidadeImagens
        )
      ) {
        return `Imagens ausentes ou inválidas no BaúDigital: ${nome}`;
      }
    } else if (
      typeof item.quantidadeImagens === "number" &&
      item.quantidadeImagens > 0
    ) {
      return `Imagens sem referência no BaúDigital: ${nome}`;
    }

    // DOCUMENTOS
    if (item.documentos !== undefined) {
      if (!Array.isArray(item.documentos)) {
        return `Lista de documentos inválida: ${nome}`;
      }

      for (const documento of item.documentos) {
        const chave = documento?.chaveDocumento;
        const arquivo = chave
          ? bau.documentosIndexedDB?.[chave]
          : undefined;

        if (
          !chave ||
          !arquivo ||
          typeof arquivo.conteudo !== "string" ||
          !/^data:[^,]+;base64,/.test(arquivo.conteudo)
        ) {
          return `Documento ausente ou inválido no BaúDigital: ${nome}`;
        }

        try {
          if (dataURLParaBlob(arquivo.conteudo).size === 0) {
            return `Documento vazio no BaúDigital: ${nome}`;
          }
        } catch {
          return `Documento corrompido no BaúDigital: ${nome}`;
        }
      }
    }
  }

  return null;
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

      const linksPendentes =
        dados?.dados?.linksPendentes;

      if (
        linksPendentes !== undefined &&
        (
          !Array.isArray(linksPendentes) ||
          !linksPendentes.every(
            (link) =>
              link !== null &&
              typeof link === "object" &&
              typeof link.id === "string" &&
              link.id.trim() !== "" &&
              typeof link.titulo === "string" &&
              typeof link.url === "string" &&
              /^https?:\/\/\S+$/i.test(link.url) &&
              typeof link.criadoEm === "string" &&
              !Number.isNaN(Date.parse(link.criadoEm)) &&
              link.status === "pendente"
          )
        )
      ) {
        return {
          valido: false,
          mensagem:
            "O backup possui Links Pendentes inválidos.",

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

    // Validação dos áudios do BaúDigital
    const audiosBackup =
      bookdigital.audiosIndexedDB;

    if (audiosBackup !== undefined) {
      if (
        !audiosBackup ||
        typeof audiosBackup !== "object" ||
        Array.isArray(audiosBackup) ||
        Object.entries(audiosBackup).some(
          ([chave, conteudo]) =>
            !chave ||
            typeof conteudo !== "string" ||
            !/^data:audio\/[^,]+;base64,/.test(conteudo)
        )
      ) {
        return {
          valido: false,
          mensagem:
            "O backup contém arquivos de áudio inválidos.",

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

    // Verifica se todos os áudios dos itens estão no backup
    const chavesReferenciadas = new Set<string>();

    for (const item of bookdigital.itens) {
      if (!item || typeof item !== "object") continue;

      const registro = item as {
        chaveAudio?: string;
        chavesAudios?: string[];
      };

      if (registro.chaveAudio) {
        chavesReferenciadas.add(registro.chaveAudio);
      }

      if (Array.isArray(registro.chavesAudios)) {
        for (const chave of registro.chavesAudios) {
          if (chave) chavesReferenciadas.add(chave);
        }
      }
    }

    const audiosAusentes = [...chavesReferenciadas].filter(
      (chave) => !Object.prototype.hasOwnProperty.call(
        audiosBackup ?? {},
        chave
      )
    );

    if (audiosAusentes.length > 0) {
      return {
        valido: false,
        mensagem:
          `O backup possui ${audiosAusentes.length} áudio(s) ausente(s).`,
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

if (
  Array.isArray(dados.pendencias) &&
  dados.pendencias.length > 0
) {
  return {
    valido: false,
    mensagem:
      "Este backup contém " +
      dados.pendencias.length +
      " pendência(s). Alguns conteúdos não foram incluídos. " +
      "A restauração integral foi bloqueada para proteger os dados existentes.",

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

    const problemaIntegridade =
      verificarIntegridadeBackup(
        dados as BackupGeralAppV1
      );

    if (problemaIntegridade) {
      return {
        valido: false,
        mensagem:
          "O backup possui um problema de integridade: " +
          problemaIntegridade +
          ". Nenhum dado foi restaurado.",

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

      linksPendentes:
        Array.isArray(linksPendentes)
          ? linksPendentes.length
          : 0,

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

const CHAVE_RESTAURACAO_PENDENTE =
  "healthRestauracaoGeralPendente";

export function verificarRestauracaoPendente(): boolean {
  try {
    return (
      localStorage.getItem(
        CHAVE_RESTAURACAO_PENDENTE
      ) !== null
    );
  } catch {
    return true;
  }
}


// ============================================================
// RESTAURAR BACKUP GERAL
// ============================================================

export async function restaurarBackupApp(
  backup: BackupGeralAppV1,
  modo: "normal" | "recuperacao" = "normal"
) {
  try {
    // Bloqueia backups que possuem conteúdos omitidos.
    // A verificação ocorre antes de alterar qualquer dado.
    if (
      Array.isArray(backup.pendencias) &&
      backup.pendencias.length > 0
    ) {
      return {
        sucesso: false,
        mensagem:
          "Este backup possui conteúdos não incluídos " +
          "e não pode ser restaurado integralmente. " +
          "Os dados atuais do aplicativo foram preservados.",
      };
    }

    // Confere todos os anexos antes de iniciar a restauração.
    const problemaIntegridade =
      verificarIntegridadeBackup(backup);

    if (problemaIntegridade) {
      return {
        sucesso: false,
        mensagem:
          "Restauração bloqueada. " +
          problemaIntegridade +
          ". Nenhum dado foi alterado.",
      };
    }

    // Registra o início antes da primeira gravação.
    // Se não conseguir registrar, não inicia a restauração.

    const restauracaoPendente =
      verificarRestauracaoPendente();

      if (modo === "normal" && restauracaoPendente) {
        return {
          sucesso: false,
          mensagem:
            "Existe uma restauração anterior não concluída. " +
            "É necessário recuperar os dados antes " +
            "de iniciar uma nova restauração.",
        };
      }

      if (modo === "recuperacao" && !restauracaoPendente) {
        return {
          sucesso: false,
          mensagem:
            "Não existe restauração pendente para recuperar.",
        };
      }

      if (modo === "normal") {
        localStorage.setItem(
          CHAVE_RESTAURACAO_PENDENTE,
          new Date().toISOString()
        );
      }

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

      // ============================================================
      // RESTAURA ÁUDIOS DO BOOKDIGITAL
      // ============================================================

      const audios =
        backup.dados.bookdigital.audiosIndexedDB || {};

      for (const [chave, conteudo] of Object.entries(audios)) {
        if (
          typeof conteudo !== "string" ||
          !conteudo.startsWith("data:audio/")
        ) {
          throw new Error(
            `Arquivo de áudio inválido no backup: ${chave}`
          );
        }

        const blob = dataURLParaBlob(conteudo);

        await salvarAudio(chave, blob);
      }

    // ============================================================
    // 6. RESTAURA LINKS PENDENTES
    // ============================================================

    const linksPendentes =
      backup.dados.linksPendentes;

    if (Array.isArray(linksPendentes)) {
      localStorage.setItem(
        "healthLinksPendentes",
        JSON.stringify(linksPendentes)
      );
    }

    // Todas as gravações terminaram sem erro.
    // A restauração não está mais pendente.

    localStorage.removeItem(
      CHAVE_RESTAURACAO_PENDENTE
    );

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