import {
  obterImagensCarrossel,
  obterPrintsReceita,
  obterCapaReceita,
} from "@/app/utils/carrosselIndexedDB";

export type ResultadoPacoteUsuarios = {
  sucesso: boolean;
  nomeArquivo?: string;
  quantidadeReceitasPesquisa?: number;
  quantidadeOrientativas?: number;
  quantidadeTotal?: number;
  quantidadeCapas?: number;
  quantidadeCarrosseis?: number;
  quantidadePrints?: number;
  mensagem?: string;
};

export async function exportarPacoteUsuarios(): Promise<ResultadoPacoteUsuarios> {
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

    const receitasPesquisa = receitasOficiais.filter(
      (receita) => receita?.colecaoInicial === true
    );

    const receitasOrientativas = receitasOficiais.filter(
      (receita) => {
        const nome = String(receita?.nome || "")
          .trim()
          .toLocaleLowerCase("pt-BR");

        return (
          nome.startsWith("modelo") ||
          nome.startsWith("roteiro")
        );
      }
    );

    const idsSelecionados = new Set<string>();

    const receitasPacote = [
      ...receitasPesquisa,
      ...receitasOrientativas,
    ].filter((receita) => {
      const id = String(receita?.id || "");

      if (!id || idsSelecionados.has(id)) {
        return false;
      }

      idsSelecionados.add(id);
      return true;
    });

    const carrosseisIndexedDB: Record<string, string[]> = {};
    const printsIndexedDB: Record<string, string[]> = {};
    const capasIndexedDB: Record<string, string> = {};

    for (const receita of receitasPacote) {
      // ============================================================
      // CAPA
      // ============================================================

      const chaveCapa =
        typeof receita?.chaveImagemCapa === "string" &&
        receita.chaveImagemCapa
          ? receita.chaveImagemCapa
          : receita.id;

      if (chaveCapa) {
        try {
          const capa = await obterCapaReceita(chaveCapa);

          if (capa) {
            capasIndexedDB[chaveCapa] = capa;
          }
        } catch (erro) {
          console.warn(
            `Não foi possível carregar a capa ${chaveCapa}:`,
            erro
          );
        }
      }

      // ============================================================
      // CARROSSEL
      // ============================================================

      const chaveCarrossel =
        receita?.carrossel?.chaveImagens;

      if (chaveCarrossel) {
        try {
          const imagens =
            await obterImagensCarrossel(chaveCarrossel);

          if (
            Array.isArray(imagens) &&
            imagens.length > 0
          ) {
            carrosseisIndexedDB[chaveCarrossel] =
              imagens;
          }
        } catch (erro) {
          console.warn(
            `Não foi possível carregar o carrossel ${chaveCarrossel}:`,
            erro
          );
        }
      }

      // ============================================================
      // PRINTS
      // ============================================================

      const chavePrints =
        receita?.chavePrintsLegenda;

      if (chavePrints) {
        try {
          const imagens =
            await obterPrintsReceita(chavePrints);

          if (
            Array.isArray(imagens) &&
            imagens.length > 0
          ) {
            printsIndexedDB[chavePrints] =
              imagens;
          }
        } catch (erro) {
          console.warn(
            `Não foi possível carregar os prints ${chavePrints}:`,
            erro
          );
        }
      }
    }

    const backup = {
      app: "Receitas Health",
      tipo: "pacote-usuarios",
      versaoPacote: 1,
      exportadoEm: new Date().toISOString(),

      dados: {
        receitas: receitasPacote,
        carrosseisIndexedDB,
        printsIndexedDB,
        capasIndexedDB,
      },
    };

    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(
      agora.getMonth() + 1
    ).padStart(2, "0");
    const dia = String(
      agora.getDate()
    ).padStart(2, "0");
    const hora = String(
      agora.getHours()
    ).padStart(2, "0");
    const minuto = String(
      agora.getMinutes()
    ).padStart(2, "0");
    const segundo = String(
      agora.getSeconds()
    ).padStart(2, "0");

    const nomeArquivo =
      `receitas-health-pacote-usuarios-${ano}-${mes}-${dia}-${hora}-${minuto}-${segundo}.json`;

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
      quantidadeReceitasPesquisa:
        receitasPesquisa.length,
      quantidadeOrientativas:
        receitasOrientativas.length,
      quantidadeTotal:
        receitasPacote.length,
      quantidadeCapas:
        Object.keys(capasIndexedDB).length,
      quantidadeCarrosseis:
        Object.keys(carrosseisIndexedDB).length,
      quantidadePrints:
        Object.keys(printsIndexedDB).length,
    };
  } catch (erro) {
    console.error(
      "Erro ao criar Pacote Usuários:",
      erro
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível criar o Pacote Usuários.",
    };
  }
}