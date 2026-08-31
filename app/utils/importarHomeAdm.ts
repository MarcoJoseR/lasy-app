import { salvarImagensCarrossel } from "@/app/utils/carrosselIndexedDB";

export type ResultadoValidacaoBackupHomeAdm = {
  valido: boolean;
  mensagem: string;
  receitasEncontradas: number;
  carrosseisEncontrados: number;

  backup?: {
    app: string;
    tipo: string;
    versaoBackup: number;
    exportadoEm: string;
    dados: {
      receitas: unknown[];
      carrosseisIndexedDB?: Record<string, string[]>;
    };
  };
};

export async function validarBackupHomeAdm(
  arquivo: File
): Promise<ResultadoValidacaoBackupHomeAdm> {
  try {
    const texto = await arquivo.text();
    const dados = JSON.parse(texto);

    if (
      dados?.app !== "Receitas Health" ||
      dados?.tipo !== "backup-home-adm" ||
      dados?.versaoBackup !== 1
    ) {
      return {
        valido: false,
        mensagem: "O arquivo não é um backup válido da Home ADM.",
        receitasEncontradas: 0,
        carrosseisEncontrados: 0,
      };
    }

    if (
      !dados?.dados ||
      !Array.isArray(dados.dados.receitas)
    ) {
      return {
        valido: false,
        mensagem: "O backup da Home ADM está incompleto ou possui estrutura inválida.",
        receitasEncontradas: 0,
        carrosseisEncontrados: 0,
      };
    }

    const receitasInvalidas = dados.dados.receitas.some(
      (receita: any) => receita?.tipo !== "oficial"
    );

    if (receitasInvalidas) {
      return {
        valido: false,
        mensagem: "O backup contém receitas que não pertencem à Home ADM.",
        receitasEncontradas: 0,
        carrosseisEncontrados: 0,
      };
    }

    return {
      valido: true,
      mensagem: "Backup da Home ADM válido.",
      receitasEncontradas: dados.dados.receitas.length,
      carrosseisEncontrados:
        dados?.dados?.carrosseisIndexedDB &&
        typeof dados.dados.carrosseisIndexedDB === "object"
          ? Object.keys(dados.dados.carrosseisIndexedDB).length
          : 0,
      backup: dados,
    };
  } catch (erro) {
    console.error("Erro ao validar backup da Home ADM:", erro);

    return {
      valido: false,
      mensagem: "Não foi possível ler o arquivo de backup da Home ADM.",
      receitasEncontradas: 0,
      carrosseisEncontrados: 0,
    };
  }
}

export async function restaurarHomeAdm(
  backup: {
    dados: {
      receitas: unknown[];
      carrosseisIndexedDB?: Record<string, string[]>;
    };
  }
) {
  try {
    const dadosAtuaisSalvos =
      localStorage.getItem("minhaBiblioteca");

    const dadosAtuais = dadosAtuaisSalvos
      ? JSON.parse(dadosAtuaisSalvos)
      : [];

    const receitasPessoais = Array.isArray(dadosAtuais)
      ? dadosAtuais.filter(
          (receita) => receita?.tipo === "pessoal"
        )
      : [];

    const receitasRestauradas = [
      ...backup.dados.receitas,
      ...receitasPessoais,
    ];

    localStorage.setItem(
      "minhaBiblioteca",
      JSON.stringify(receitasRestauradas)
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

    return {
      sucesso: true,
      mensagem: "Home ADM restaurada com sucesso.",
    };
  } catch (erro) {
    console.error("Erro ao restaurar Home ADM:", erro);

    return {
      sucesso: false,
      mensagem: "Não foi possível restaurar a Home ADM.",
    };
  }
}