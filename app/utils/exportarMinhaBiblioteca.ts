import {
  obterImagensCarrossel,
  obterPrintsReceita,
  obterCapaReceita,
} from "@/app/utils/carrosselIndexedDB";

type BackupReceitasHealthV3 = {
  app: "Receitas Health";
  tipo: "backup-minha-biblioteca";
  versaoBackup: 3;
  exportadoEm: string;

  dados: {
    receitas: any[];
    listasCompras: unknown[];

    carrosseisIndexedDB: Record<string, string[]>;
    printsIndexedDB: Record<string, string[]>;
    capasIndexedDB: Record<string, string>;
  };
};

export async function exportarMinhaBiblioteca() {
  try {
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

    // O backup do usuário leva somente suas receitas pessoais.
    // Receitas oficiais/Coleção Inicial não precisam ser transportadas.
    const receitasPessoais = Array.isArray(receitas)
      ? receitas.filter(
          (receita) => receita?.tipo === "pessoal"
        )
      : [];

    // ============================================================
    // CARROSSÉIS
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
          carrosseisIndexedDB[chaveImagens] =
            imagens;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir carrossel ${chaveImagens} no backup:`,
          erro
        );
      }
    }

    // ============================================================
    // PRINTS DE LEGENDA
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
          `Erro ao incluir prints ${chavePrints} no backup:`,
          erro
        );
      }
    }

    // ============================================================
    // CAPAS DAS RECEITAS
    // ============================================================

    const capasIndexedDB: Record<
      string,
      string
    > = {};

    for (const receita of receitasPessoais) {
      const chaveCapa =
        receita?.chaveImagemCapa;

      if (!chaveCapa) continue;

      try {
        const capa =
          await obterCapaReceita(chaveCapa);

        if (capa) {
          capasIndexedDB[chaveCapa] = capa;
        }
      } catch (erro) {
        console.error(
          `Erro ao incluir capa ${chaveCapa} no backup:`,
          erro
        );
      }
    }

    // ============================================================
    // MONTA BACKUP V3
    // ============================================================

    const backup: BackupReceitasHealthV3 = {
      app: "Receitas Health",
      tipo: "backup-minha-biblioteca",
      versaoBackup: 3,
      exportadoEm: new Date().toISOString(),

      dados: {
        receitas: receitasPessoais,

        listasCompras: Array.isArray(
          listasCompras
        )
          ? listasCompras
          : [],

        carrosseisIndexedDB,
        printsIndexedDB,
        capasIndexedDB,
      },
    };

    const conteudo =
      JSON.stringify(backup, null, 2);

    const blob = new Blob([conteudo], {
      type: "application/json;charset=utf-8",
    });

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
      `receitas-health-backup-${hoje}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return {
      sucesso: true,

      receitasExportadas:
        receitasPessoais.length,

      listasExportadas:
        Array.isArray(listasCompras)
          ? listasCompras.length
          : 0,

      carrosseisExportados:
        Object.keys(
          carrosseisIndexedDB
        ).length,

      printsExportados:
        Object.keys(
          printsIndexedDB
        ).length,

      capasExportadas:
        Object.keys(
          capasIndexedDB
        ).length,
    };
  } catch (erro) {
    console.error(
      "Erro ao exportar Minha Biblioteca:",
      erro
    );

    return {
      sucesso: false,
      receitasExportadas: 0,
      listasExportadas: 0,
      carrosseisExportados: 0,
      printsExportados: 0,
      capasExportadas: 0,
    };
  }
}