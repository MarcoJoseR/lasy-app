export type ResultadoValidacaoBackup = {
  valido: boolean;
  mensagem: string;
  receitasEncontradas: number;
  listasEncontradas: number;
  backup?: {
    app: string;
    tipo: string;
    versaoBackup: number;
    exportadoEm: string;
    dados: {
      receitas: unknown[];
      listasCompras: unknown[];
    };
  };
};

export async function validarBackupMinhaBiblioteca(
  arquivo: File
): Promise<ResultadoValidacaoBackup> {
  try {
    const texto = await arquivo.text();
    const dados = JSON.parse(texto);

    if (
      dados?.app !== "Receitas Health" ||
      dados?.tipo !== "backup-minha-biblioteca" ||
      dados?.versaoBackup !== 1
    ) {
      return {
        valido: false,
        mensagem: "O arquivo não é um backup válido do Receitas Health V1.",
        receitasEncontradas: 0,
        listasEncontradas: 0,
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
      };
    }

    return {
      valido: true,
      mensagem: "Backup válido.",
      receitasEncontradas: dados.dados.receitas.length,
      listasEncontradas: dados.dados.listasCompras.length,
      backup: dados,
    };
  } catch (erro) {
    console.error("Erro ao validar backup:", erro);

    return {
      valido: false,
      mensagem: "Não foi possível ler o arquivo de backup.",
      receitasEncontradas: 0,
      listasEncontradas: 0,
    };
  }
}

export function restaurarMinhaBiblioteca(
  backup: {
    dados: {
      receitas: unknown[];
      listasCompras: unknown[];
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