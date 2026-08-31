import {
  salvarImagensCarrossel,
  salvarPrintsReceita,
} from "@/app/utils/carrosselIndexedDB";

export type ResultadoValidacaoBackup = {
  valido: boolean;
  mensagem: string;
  receitasEncontradas: number;
  listasEncontradas: number;
  carrosseisEncontrados: number;

  backup?: {
    app: string;
    tipo: string;
    versaoBackup: number;
    exportadoEm: string;
    dados: {
      receitas: unknown[];
      listasCompras: unknown[];
      carrosseisIndexedDB?: Record<string, string[]>;
	printsIndexedDB?: Record<string, string[]>;
    };
  };
};

export async function validarBackupMinhaBiblioteca(
  arquivo: File
): Promise<ResultadoValidacaoBackup> {
  try {
    const texto = await arquivo.text();
    const dados = JSON.parse(texto);

    const versaoValida =
      dados?.versaoBackup === 1 ||
      dados?.versaoBackup === 2;

    if (
      dados?.app !== "Receitas Health" ||
      dados?.tipo !== "backup-minha-biblioteca" ||
      !versaoValida
    ) {

      return {
        valido: false,
        mensagem: "O arquivo não é um backup válido do Receitas Health.",
        receitasEncontradas: 0,
        listasEncontradas: 0,
        carrosseisEncontrados: 0,
      };
    }

    if (
      !dados?.dados ||
      !Array.isArray(dados.dados.receitas) ||
      !Array.isArray(dados.dados.listasCompras)
    ) {
      return {
        valido: false,
        mensagem: "O backup está incompleto ou possui estrutura inválida.",
        receitasEncontradas: 0,
        listasEncontradas: 0,
        carrosseisEncontrados: 0,
      };
    }

    const receitasInvalidas = dados.dados.receitas.some(
      (receita: any) => receita?.tipo !== "pessoal"
    );

    if (receitasInvalidas) {
      return {
        valido: false,
        mensagem:
          "O backup contém receitas que não pertencem à biblioteca pessoal.",
        receitasEncontradas: 0,
        listasEncontradas: 0,
        carrosseisEncontrados: 0,
      };
    }

    return {
      valido: true,
      mensagem: "Backup válido.",
      receitasEncontradas: dados.dados.receitas.length,
      listasEncontradas: dados.dados.listasCompras.length,
      carrosseisEncontrados:
        dados?.dados?.carrosseisIndexedDB &&
        typeof dados.dados.carrosseisIndexedDB === "object"
          ? Object.keys(
              dados.dados.carrosseisIndexedDB
            ).length
          : 0,
      
      backup: dados,
    };
  } catch (erro) {
    console.error("Erro ao validar backup:", erro);

    return {
      valido: false,
      mensagem: "Não foi possível ler o arquivo de backup.",
      receitasEncontradas: 0,
      listasEncontradas: 0,
      carrosseisEncontrados: 0,
    };
  }
}

export async function restaurarMinhaBiblioteca(
      
  backup: {
    dados: {
      receitas: unknown[];
      listasCompras: unknown[];
      carrosseisIndexedDB?: Record<string, string[]>;
	printsIndexedDB?: Record<string, string[]>;
    };
  }
) {
  try {
    const receitasAtuaisSalvas =
      localStorage.getItem("minhaBiblioteca");

    const receitasAtuais = receitasAtuaisSalvas
      ? JSON.parse(receitasAtuaisSalvas)
      : [];

    const receitasOficiais = Array.isArray(receitasAtuais)
      ? receitasAtuais.filter(
          (receita) => receita?.tipo === "oficial"
        )
      : [];

    const receitasRestauradas = [
      ...receitasOficiais,
      ...backup.dados.receitas,
    ];

    localStorage.setItem(
      "minhaBiblioteca",
      JSON.stringify(receitasRestauradas)
    );

    localStorage.setItem(
      "listasCompras",
      JSON.stringify(backup.dados.listasCompras)
    );

    const carrosseis =
      backup.dados.carrosseisIndexedDB || {};

    for (const [chave, imagens] of Object.entries(carrosseis)) {
      if (!Array.isArray(imagens)) continue;

      await salvarImagensCarrossel(
        chave,
        imagens
      );
    }

    const prints =
      backup.dados.printsIndexedDB || {};

    for (const [chave, imagens] of Object.entries(prints)) {
      if (!Array.isArray(imagens)) continue;

      await salvarPrintsReceita(
        chave,
        imagens
      );
    }

    return {
      sucesso: true,
      mensagem: "Minha Biblioteca foi restaurada com sucesso.",
    };
  } catch (erro) {
    console.error("Erro ao restaurar Minha Biblioteca:", erro);

    return {
      sucesso: false,
      mensagem: "Não foi possível restaurar a Minha Biblioteca.",
    };
  }
}