import type { Receita } from "@/app/context/ReceitasContext";

import {
  salvarImagensCarrossel,
  salvarPrintsReceita,
  salvarCapaReceita,
} from "@/app/utils/carrosselIndexedDB";

type PacoteUsuarios = {
  app: string;
  tipo: string;
  versaoPacote: number;

  dados: {
    receitas: Receita[];

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
};

export type ResultadoInicializacaoPacote = {
  receitas: Receita[];
  quantidadeOficiais: number;
  quantidadePessoais: number;
  quantidadeCarrosseis: number;
  quantidadePrints: number;
  quantidadeCapas: number;
};

export async function inicializarPacoteUsuarios(): Promise<ResultadoInicializacaoPacote> {
  const resposta = await fetch(
    "/data/pacote-usuarios-v1.json",
    {
      cache: "no-store",
    }
  );

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar o Pacote Usuários."
    );
  }

  const pacote =
    (await resposta.json()) as PacoteUsuarios;

  if (
    pacote.app !== "Receitas Health" ||
    pacote.tipo !== "pacote-usuarios" ||
    !Array.isArray(pacote.dados?.receitas)
  ) {
    throw new Error(
      "O arquivo do Pacote Usuários é inválido."
    );
  }

  // ============================================================
  // RESTAURA CARROSSÉIS
  // ============================================================

  const carrosseis =
    pacote.dados.carrosseisIndexedDB || {};

  for (const [chave, imagens] of Object.entries(
    carrosseis
  )) {
    if (
      Array.isArray(imagens) &&
      imagens.length > 0
    ) {
      await salvarImagensCarrossel(
        chave,
        imagens
      );
    }
  }

  // ============================================================
  // RESTAURA PRINTS
  // ============================================================

  const prints =
    pacote.dados.printsIndexedDB || {};

  for (const [chave, imagens] of Object.entries(
    prints
  )) {
    if (
      Array.isArray(imagens) &&
      imagens.length > 0
    ) {
      await salvarPrintsReceita(
        chave,
        imagens
      );
    }
  }

  // ============================================================
  // RESTAURA CAPAS
  // ============================================================

  const capas =
    pacote.dados.capasIndexedDB || {};

  for (const [chave, imagem] of Object.entries(
    capas
  )) {
    if (
      typeof imagem === "string" &&
      imagem.length > 0
    ) {
      await salvarCapaReceita(
        chave,
        imagem
      );
    }
  }

  // ============================================================
  // PREPARA AS RECEITAS DO PRIMEIRO ACESSO
  // ============================================================

  const receitasPreparadas: Receita[] =
    pacote.dados.receitas.map((receita) => {
      const nome = String(
        receita.nome || ""
      )
        .trim()
        .toLocaleLowerCase("pt-BR");

      const orientativa =
        nome.startsWith("modelo") ||
        nome.startsWith("roteiro");

      if (orientativa) {
        return {
          ...receita,
          tipo: "pessoal",
          colecaoInicial: false,
          favorito: false,
        };
      }

      return {
        ...receita,
        tipo: "oficial",
        colecaoInicial: true,
        favorito: false,
      };
    });

  const quantidadeOficiais =
    receitasPreparadas.filter(
      (receita) =>
        receita.tipo === "oficial"
    ).length;

  const quantidadePessoais =
    receitasPreparadas.filter(
      (receita) =>
        receita.tipo === "pessoal"
    ).length;

  return {
    receitas: receitasPreparadas,
    quantidadeOficiais,
    quantidadePessoais,
    quantidadeCarrosseis:
      Object.keys(carrosseis).length,
    quantidadePrints:
      Object.keys(prints).length,
    quantidadeCapas:
      Object.keys(capas).length,
  };
}