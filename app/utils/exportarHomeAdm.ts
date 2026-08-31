import { obterImagensCarrossel } from "@/app/utils/carrosselIndexedDB";

export type ResultadoBackupHomeAdm = {
  sucesso: boolean;
  nomeArquivo?: string;
  quantidadeReceitas?: number;
  quantidadeCarrosseis?: number;
  mensagem?: string;
};

export async function exportarBackupHomeAdm(): Promise<ResultadoBackupHomeAdm> {
  try {
    const dadosSalvos = localStorage.getItem("minhaBiblioteca");

    const receitas = dadosSalvos
      ? JSON.parse(dadosSalvos)
      : [];

    if (!Array.isArray(receitas)) {
      return {
        sucesso: false,
        mensagem: "A estrutura de receitas armazenada é inválida.",
      };
    }

    const receitasOficiais = receitas.filter(
      (receita) => receita?.tipo === "oficial"
    );

    const carrosseisIndexedDB: Record<string, string[]> = {};

    for (const receita of receitasOficiais) {
      const chaveImagens = receita?.carrossel?.chaveImagens;

      if (!chaveImagens) continue;

      try {
        const imagens = await obterImagensCarrossel(chaveImagens);

        if (Array.isArray(imagens) && imagens.length > 0) {
          carrosseisIndexedDB[chaveImagens] = imagens;
        }
      } catch (erro) {
        console.warn(
          `Não foi possível carregar o carrossel ${chaveImagens}:`,
          erro
        );
      }
    }

    const backup = {
      app: "Receitas Health",
      tipo: "backup-home-adm",
      versaoBackup: 1,
      exportadoEm: new Date().toISOString(),
      dados: {
        receitas: receitasOficiais,
        carrosseisIndexedDB,
      },
    };

    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    const nomeArquivo =
      `receitas-health-home-adm-${ano}-${mes}-${dia}-${hora}-${minuto}-${segundo}.json`;

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return {
      sucesso: true,
      nomeArquivo,
      quantidadeReceitas: receitasOficiais.length,
      quantidadeCarrosseis: Object.keys(carrosseisIndexedDB).length,
    };
  } catch (erro) {
    console.error("Erro ao criar backup da Home ADM:", erro);

    return {
      sucesso: false,
      mensagem: "Não foi possível criar o backup da Home ADM.",
    };
  }
}