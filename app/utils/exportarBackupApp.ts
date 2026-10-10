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

type BackupAppV1 = {
  app: "Health";
  tipo: "backup-geral-app";
  versaoBackup: 1;
  exportadoEm: string;

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

    // ============================================================
    // HEALTH - CARROSSÉIS
    // ============================================================

    const carrosseisIndexedDB: Record<
      string,
      string[]
    > = {};

    for (const receita of receitasPessoais) {
      const chaveImagens =
        receita?.carrossel?.chaveImagens;

      if (!chaveImagens) continue;

      try {
        const imagens =
          await obterImagensCarrossel(
            chaveImagens
          );

        if (imagens.length > 0) {
          carrosseisIndexedDB[
            chaveImagens
          ] = imagens;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir carrossel ${chaveImagens}:`,
          erro
        );
      }
    }

    // ============================================================
    // HEALTH - PRINTS
    // ============================================================

    const printsIndexedDB: Record<
      string,
      string[]
    > = {};

    for (const receita of receitasPessoais) {
      const chavePrints =
        receita?.chavePrintsLegenda;

      if (!chavePrints) continue;

      try {
        const prints =
          await obterPrintsReceita(
            chavePrints
          );

        if (prints.length > 0) {
          printsIndexedDB[chavePrints] =
            prints;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir prints ${chavePrints}:`,
          erro
        );
      }
    }

    // ============================================================
    // HEALTH - CAPAS
    // ============================================================

    const capasHealthIndexedDB: Record<
      string,
      string
    > = {};

    for (const receita of receitasPessoais) {
      const chaveCapa =
        receita?.chaveImagemCapa;

      if (!chaveCapa) continue;

      try {
        const capa =
          await obterCapaReceita(
            chaveCapa
          );

        if (capa) {
          capasHealthIndexedDB[
            chaveCapa
          ] = capa;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir capa ${chaveCapa}:`,
          erro
        );
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

    // ============================================================
    // BOOKDIGITAL - CAPAS
    // ============================================================

    const capasBookDigitalIndexedDB:
      Record<string, string> = {};

    for (const item of listaItens) {
      const chaveCapa =
        item?.chaveImagemCapa;

      if (!chaveCapa) continue;

      try {
        const capa =
          await obterImagemCapa(
            chaveCapa
          );

        if (capa) {
          capasBookDigitalIndexedDB[
            chaveCapa
          ] = capa;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir capa BookDigital ${chaveCapa}:`,
          erro
        );
      }
    }

    // ============================================================
    // BOOKDIGITAL - IMAGENS DOS ITENS
    // ============================================================

    const imagensBookDigitalIndexedDB:
      Record<string, string[]> = {};

    for (const item of listaItens) {
      const chaveImagens =
        item?.chaveImagens;

      if (!chaveImagens) continue;

      try {
        const imagens =
          await obterImagensItem(
            chaveImagens
          );

        if (imagens.length > 0) {
          imagensBookDigitalIndexedDB[
            chaveImagens
          ] = imagens;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir imagens BookDigital ${chaveImagens}:`,
          erro
        );
      }
    }

    // ============================================================
    // BOOKDIGITAL - DOCUMENTOS
    // ============================================================

    const documentosBookDigitalIndexedDB:
      Record<
        string,
        {
          nomeDocumento: string;
          tipoDocumento?: string;
          conteudo: string;
        }
      > = {};

    for (const item of listaItens) {
      if (
        !Array.isArray(item?.documentos)
      ) {
        continue;
      }

      for (const documento of item.documentos) {
        const chaveDocumento =
          documento?.chaveDocumento;

        if (!chaveDocumento) continue;

        try {
          const arquivo =
            await obterDocumento(
              chaveDocumento
            );

          if (!arquivo) continue;

          const conteudo =
            await blobParaDataURL(
              arquivo
            );

          documentosBookDigitalIndexedDB[
            chaveDocumento
          ] = {
            nomeDocumento:
              documento.nomeDocumento,

            tipoDocumento:
              documento.tipoDocumento,

            conteudo,
          };
        } catch (erro) {
          console.error(
            `Erro ao incluir documento ${chaveDocumento}:`,
            erro
          );
        }
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

      dados: {
        health: {
          receitas: receitasPessoais,

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
          itens: listaItens,

          capasIndexedDB:
            capasBookDigitalIndexedDB,

          imagensIndexedDB:
            imagensBookDigitalIndexedDB,

          documentosIndexedDB:
            documentosBookDigitalIndexedDB,
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

      health: {
        receitas:
          receitasPessoais.length,

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
        itens: listaItens.length,

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