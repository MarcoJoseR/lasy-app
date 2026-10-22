import {
  obterImagensCarrossel,
  obterPrintsReceita,
  obterCapaReceita,
} from "@/app/utils/carrosselIndexedDB";

import {
  obterImagemCapa,
  obterImagensItem,
} from "@/app/lib/bookdigital-imagens";

import {
  obterDocumento,
} from "@/app/lib/bookdigital-arquivos";

import {
  listarLinksPendentes,
  type LinkPendente,
} from "@/app/lib/links-pendentes";

import {
  obterAudio,
} from "@/app/lib/bookdigital-audios";

type BackupAppV1 = {
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
      receitas: any[];
      listasCompras: unknown[];

      carrosseisIndexedDB: Record<
        string,
        string[]
      >;

      printsIndexedDB: Record<
        string,
        string[]
      >;

      capasIndexedDB: Record<
        string,
        string
      >;
    };

    bookdigital: {
      temas: any[];
      itens: any[];

      capasIndexedDB: Record<
        string,
        string
      >;

      imagensIndexedDB: Record<
        string,
        string[]
      >;

      documentosIndexedDB: Record<
        string,
        {
          nomeDocumento: string;
          tipoDocumento?: string;
          conteudo: string;
        }
       >;

      audiosIndexedDB: Record<string, string>;
    };

    linksPendentes: LinkPendente[];
  };
};

function blobParaDataURL(
  blob: Blob
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error(
            "Não foi possível converter o documento."
          )
        );
      }
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
}

export async function exportarBackupApp() {
  try {

    const pendencias: {
      modulo: "Health" | "BaúDigital";
      nome: string;
      problema: string;
    }[] = [];

    // ============================================================
    // HEALTH - LOCALSTORAGE
    // ============================================================

    const receitasSalvas =
      localStorage.getItem("minhaBiblioteca");

    const listasSalvas =
      localStorage.getItem("listasCompras");

    const receitas = receitasSalvas
      ? JSON.parse(receitasSalvas)
      : [];

    const listasCompras = listasSalvas
      ? JSON.parse(listasSalvas)
      : [];

    const receitasPessoais = Array.isArray(
      receitas
    )
      ? receitas.filter(
          (receita) =>
            receita?.tipo === "pessoal"
        )
      : [];

    const receitasValidadas: typeof receitasPessoais = [];

    // ============================================================
// HEALTH - VALIDAR RECEITAS E ANEXOS
// ============================================================

const carrosseisIndexedDB: Record<string, string[]> = {};
const printsIndexedDB: Record<string, string[]> = {};
const capasHealthIndexedDB: Record<string, string> = {};

for (const receita of receitasPessoais) {
  const nome = receita?.nome || "Receita sem nome";

  try {
    const chaveCarrossel =
      receita?.carrossel?.chaveImagens;

    const chavePrints =
      receita?.chavePrintsLegenda;

    const chaveCapa =
      receita?.chaveImagemCapa;

    let imagensCarrossel: string[] | null = null;
    let prints: string[] | null = null;
    let capa: string | null = null;

    // CARROSSEL
    if (receita?.tipoConteudo === "carrossel") {
      if (!chaveCarrossel) {
        throw new Error(
          "Carrossel sem referência de imagens."
        );
      }

      imagensCarrossel =
        await obterImagensCarrossel(chaveCarrossel);

      if (
        !Array.isArray(imagensCarrossel) ||
        imagensCarrossel.length === 0 ||
        imagensCarrossel.some(
          (imagem) =>
            typeof imagem !== "string" ||
            !imagem.startsWith("data:image/")
        )
      ) {
        throw new Error(
          "Imagens do carrossel ausentes ou inválidas."
        );
      }

      const quantidadeEsperada =
        receita.carrossel?.quantidadeImagens;

      if (
        typeof quantidadeEsperada === "number" &&
        quantidadeEsperada > 0 &&
        imagensCarrossel.length !== quantidadeEsperada
      ) {
        throw new Error(
          "Quantidade de imagens do carrossel divergente."
        );
      }
    }

    // PRINTS
    if (chavePrints) {
      prints = await obterPrintsReceita(chavePrints);

      if (
        !Array.isArray(prints) ||
        prints.length === 0 ||
        prints.some(
          (imagem) =>
            typeof imagem !== "string" ||
            !imagem.startsWith("data:image/")
        )
      ) {
        throw new Error(
          "Prints da receita ausentes ou inválidos."
        );
      }

      const quantidadeEsperada =
        receita?.quantidadePrintsLegenda;

      if (
        typeof quantidadeEsperada === "number" &&
        quantidadeEsperada > 0 &&
        prints.length !== quantidadeEsperada
      ) {
        throw new Error(
          "Quantidade de prints divergente."
        );
      }
    } else if (
      typeof receita?.quantidadePrintsLegenda === "number" &&
      receita.quantidadePrintsLegenda > 0
    ) {
      throw new Error(
        "Receita possui prints sem referência de armazenamento."
      );
    }

    // CAPA
    if (chaveCapa) {
      capa = await obterCapaReceita(chaveCapa);

      if (
        typeof capa !== "string" ||
        !capa.startsWith("data:image/")
      ) {
        throw new Error(
          "Capa da receita ausente ou inválida."
        );
      }
    }

    // CONFIRMA A RECEITA SOMENTE APÓS TODAS AS LEITURAS
    receitasValidadas.push(receita);

    if (chaveCarrossel && imagensCarrossel) {
      carrosseisIndexedDB[chaveCarrossel] =
        imagensCarrossel;
    }

    if (chavePrints && prints) {
      printsIndexedDB[chavePrints] = prints;
    }

    if (chaveCapa && capa) {
      capasHealthIndexedDB[chaveCapa] = capa;
    }

  } catch (erro) {
    const problema =
      erro instanceof Error
        ? erro.message
        : "Falha ao recuperar os anexos.";

    console.error(
      `Falha ao validar receita ${nome}:`,
      erro
    );

    pendencias.push({
      modulo: "Health",
      nome,
      problema,
    });
  }
}

    // ============================================================
    // BOOKDIGITAL - LOCALSTORAGE
    // ============================================================

    const temasSalvos =
      localStorage.getItem(
        "bookdigitalTemas"
      );

    const itensSalvos =
      localStorage.getItem(
        "bookdigitalItens"
      );

    const temas = temasSalvos
      ? JSON.parse(temasSalvos)
      : [];

    const itens = itensSalvos
      ? JSON.parse(itensSalvos)
      : [];

    const listaTemas = Array.isArray(temas)
      ? temas
      : [];

    const listaItens = Array.isArray(itens)
      ? itens
      : [];

    const itensValidados: typeof listaItens = [];

    // ============================================================
    // BOOKDIGITAL - VALIDAR ITENS E ANEXOS
    // ============================================================

    const capasBookDigitalIndexedDB: Record<string, string> = {};
    const imagensBookDigitalIndexedDB: Record<string, string[]> = {};

    const documentosBookDigitalIndexedDB: Record<
      string,
      {
        nomeDocumento: string;
        tipoDocumento?: string;
        conteudo: string;
      }
    > = {};

    const audiosBookDigitalIndexedDB: Record<string, string> = {};

    for (const item of listaItens) {
      const nome = item?.titulo || "Item sem título";

      try {
        const chaveCapa = item?.chaveImagemCapa;
        const chaveImagens = item?.chaveImagens;

        let capa: string | null = null;
        let imagens: string[] | null = null;

        const documentosDoItem: typeof documentosBookDigitalIndexedDB = {};
        const audiosDoItem: Record<string, string> = {};

        // CAPA
        if (chaveCapa) {
          capa = await obterImagemCapa(chaveCapa);

          if (
            typeof capa !== "string" ||
            !capa.startsWith("data:image/")
          ) {
            throw new Error("Capa ausente ou inválida.");
          }
        }

        // IMAGENS
        if (chaveImagens) {
          imagens = await obterImagensItem(chaveImagens);

          if (
            !Array.isArray(imagens) ||
            imagens.length === 0 ||
            imagens.some(
              (imagem) =>
                typeof imagem !== "string" ||
                !imagem.startsWith("data:image/")
            )
          ) {
            throw new Error("Imagens ausentes ou inválidas.");
          }

          if (
            typeof item.quantidadeImagens === "number" &&
            item.quantidadeImagens > 0 &&
            imagens.length !== item.quantidadeImagens
          ) {
            throw new Error("Quantidade de imagens divergente.");
          }
        } else if (
          typeof item?.quantidadeImagens === "number" &&
          item.quantidadeImagens > 0
        ) {
          throw new Error("Imagens sem referência de armazenamento.");
        }

        // DOCUMENTOS
        if (Array.isArray(item?.documentos)) {
          for (const documento of item.documentos) {
            const chave = documento?.chaveDocumento;

            if (!chave) {
              throw new Error("Documento sem referência de armazenamento.");
            }

            const arquivo = await obterDocumento(chave);

            if (!arquivo || arquivo.size === 0) {
              throw new Error(
                `Documento ausente: ${documento.nomeDocumento || "sem nome"}`
              );
            }

            const conteudo = await blobParaDataURL(arquivo);

            if (!conteudo.startsWith("data:")) {
              throw new Error("Documento inválido.");
            }

            documentosDoItem[chave] = {
              nomeDocumento: documento.nomeDocumento || "",
              tipoDocumento: documento.tipoDocumento,
              conteudo,
            };
          }
        }

        // ÁUDIOS
        const chavesAudiosItem = new Set<string>();

        if (item?.chaveAudio) {
          chavesAudiosItem.add(item.chaveAudio);
        }

        if (Array.isArray(item?.chavesAudios)) {
          for (const chave of item.chavesAudios) {
            if (typeof chave === "string" && chave) {
              chavesAudiosItem.add(chave);
            }
          }
        }

        for (const chave of chavesAudiosItem) {
          const arquivo = await obterAudio(chave);

          if (!arquivo || arquivo.size === 0) {
            throw new Error("Áudio ausente ou vazio.");
          }

          const conteudo = await blobParaDataURL(arquivo);

          if (!conteudo.startsWith("data:audio/")) {
            throw new Error("Áudio inválido.");
          }

          audiosDoItem[chave] = conteudo;
        }

        // CONFIRMAR O ITEM SOMENTE APÓS TODAS AS LEITURAS
        itensValidados.push(item);

        if (chaveCapa && capa) {
          capasBookDigitalIndexedDB[chaveCapa] = capa;
        }

        if (chaveImagens && imagens) {
          imagensBookDigitalIndexedDB[chaveImagens] = imagens;
        }

        Object.assign(
          documentosBookDigitalIndexedDB,
          documentosDoItem
        );

        Object.assign(
          audiosBookDigitalIndexedDB,
          audiosDoItem
        );

      } catch (erro) {
        const problema =
          erro instanceof Error
            ? erro.message
            : "Falha ao recuperar anexos do item.";

        console.error(
          `Falha ao validar item ${nome}:`,
          erro
        );

        pendencias.push({
          modulo: "BaúDigital",
          nome,
          problema,
        });
      }
    }

    // ============================================================
    // MONTA BACKUP GERAL
    // ============================================================

    const backup: BackupAppV1 = {
      app: "Health",
      tipo: "backup-geral-app",
      versaoBackup: 1,
      exportadoEm:
        new Date().toISOString(),

      pendencias,

      dados: {
        health: {
          receitas: receitasValidadas,

          listasCompras:
            Array.isArray(
              listasCompras
            )
              ? listasCompras
              : [],

          carrosseisIndexedDB,
          printsIndexedDB,

          capasIndexedDB:
            capasHealthIndexedDB,
        },

        bookdigital: {
          temas: listaTemas,
          itens: itensValidados,

          capasIndexedDB:
            capasBookDigitalIndexedDB,

          imagensIndexedDB:
            imagensBookDigitalIndexedDB,

          documentosIndexedDB:
            documentosBookDigitalIndexedDB,

          audiosIndexedDB:
            audiosBookDigitalIndexedDB,
        },

        linksPendentes: listarLinksPendentes(),
      },
    };

    // ============================================================
    // GERA ARQUIVO
    // ============================================================

    const conteudo =
      JSON.stringify(
        backup,
        null,
        2
      );

    const blob = new Blob(
      [conteudo],
      {
        type: "application/json;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const hoje =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;

    link.download =
      `health-backup-geral-${hoje}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    // ============================================================
    // RESULTADO
    // ============================================================

    return {
      sucesso: true,

      pendencias,

      health: {
        receitas:
          receitasValidadas.length,

        listas:
          Array.isArray(
            listasCompras
          )
            ? listasCompras.length
            : 0,

        carrosseis:
          Object.keys(
            carrosseisIndexedDB
          ).length,

        prints:
          Object.keys(
            printsIndexedDB
          ).length,

        capas:
          Object.keys(
            capasHealthIndexedDB
          ).length,
      },

      bookdigital: {
        temas: listaTemas.length,
        itens: itensValidados.length,

        capas:
          Object.keys(
            capasBookDigitalIndexedDB
          ).length,

        imagens:
          Object.keys(
            imagensBookDigitalIndexedDB
          ).length,

        documentos:
          Object.keys(
            documentosBookDigitalIndexedDB
          ).length,
      },

        linksPendentes:
          backup.dados.linksPendentes.length,
    };
  } catch (erro) {
    console.error(
      "Erro ao exportar backup geral:",
      erro
    );

    return {
      sucesso: false,
    };
  }
}