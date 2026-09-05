"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useReceitas, type Receita } from "@/app/context/ReceitasContext";
import {
  salvarImagensCarrossel,
  salvarPrintsReceita,
} from "@/app/utils/carrosselIndexedDB";

type ReceitaImportada = {
  id?: string;
  nome?: string;
  categoria?: string;
  subCategoria?: string;
  imagem?: string;
  ingredientes?: string[];
  modoPreparo?: string[];
  tempo?: string;
  porcoes?: string;
  origem?: string;
  video?: string;
  favorito?: boolean;
  tipo?: string;
  colecaoInicial?: boolean;
  tipoConteudo?: string;
  carrossel?: {
    imagens?: string[];
    titulo?: string;
    origemUrl?: string;
    chaveImagens?: string;
    quantidadeImagens?: number;
  };
  printsLegenda?: string[];
  chavePrintsLegenda?: string;
  tags?: string[];
  resumo?: string;
  nutricao?: Receita["nutricao"];
  preparacoes?: string[];

  [chave: string]: unknown;
};

type BackupReceitasHealth = {
  app?: string;
  tipo?: string;
  versaoBackup?: number;
  exportadoEm?: string;
  dados?: {
    minhaBiblioteca?: ReceitaImportada[];
    receitas?: ReceitaImportada[];
    carrosseisIndexedDB?: Record<string, string[]>;
    printsIndexedDB?: Record<string, string[]>;
    [chave: string]: unknown;
  };
};

export default function ImportarBibliotecaPage() {
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [receitasImportadas, setReceitasImportadas] = useState<
    ReceitaImportada[]
  >([]);
  const [erro, setErro] = useState("");
  const [arquivoValido, setArquivoValido] = useState(false);

  const [itensSelecionados, setItensSelecionados] = useState<Set<number>>(
    new Set()
  );

  const [carrosseisIndexedDB, setCarrosseisIndexedDB] = useState<
    Record<string, string[]>
  >({});

  const [printsIndexedDB, setPrintsIndexedDB] = useState<
    Record<string, string[]>
  >({});

  const [mensagemImportacao, setMensagemImportacao] = useState("");
  const [importando, setImportando] = useState(false);

  const { adicionarReceitasOficiaisEmLote } = useReceitas();

  async function handleSelecionarArquivo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    setErro("");
    setArquivoValido(false);
    setReceitasImportadas([]);
    setNomeArquivo("");
    setItensSelecionados(new Set());
    setCarrosseisIndexedDB({});
    setPrintsIndexedDB({});
    setMensagemImportacao("");

    if (!arquivo) {
      return;
    }

    setNomeArquivo(arquivo.name);

    try {
      const texto = await arquivo.text();
      const backup = JSON.parse(texto) as BackupReceitasHealth;

      if (backup.app !== "Receitas Health") {
        throw new Error(
          "O arquivo selecionado não pertence ao Receitas Health."
        );
      }

      if (!backup.dados || typeof backup.dados !== "object") {
        throw new Error(
          "O arquivo não possui uma estrutura de backup reconhecida."
        );
      }

      let receitas: ReceitaImportada[] = [];

      if (Array.isArray(backup.dados.minhaBiblioteca)) {
        receitas = backup.dados.minhaBiblioteca;
      } else if (Array.isArray(backup.dados.receitas)) {
        receitas = backup.dados.receitas;
      }

      if (receitas.length === 0) {
        throw new Error(
          "Nenhuma receita foi encontrada neste arquivo."
        );
      }

      setReceitasImportadas(receitas);
      setCarrosseisIndexedDB(
        backup.dados.carrosseisIndexedDB &&
          typeof backup.dados.carrosseisIndexedDB === "object"
          ? backup.dados.carrosseisIndexedDB
          : {}
      );

      setPrintsIndexedDB(
        backup.dados.printsIndexedDB &&
          typeof backup.dados.printsIndexedDB === "object"
          ? backup.dados.printsIndexedDB
          : {}
      );

      setArquivoValido(true);

    } catch (error) {
      console.error("Erro ao ler backup:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível ler o arquivo selecionado."
      );
    }
  }

function alternarSelecao(indice: number) {
  setItensSelecionados((selecionadosAtuais) => {
    const novosSelecionados = new Set(selecionadosAtuais);

    if (novosSelecionados.has(indice)) {
      novosSelecionados.delete(indice);
    } else {
      novosSelecionados.add(indice);
    }

    return novosSelecionados;
  });
}

function selecionarTodos() {
  setItensSelecionados(
    new Set(receitasImportadas.map((_, indice) => indice))
  );
}

function desmarcarTodos() {
  setItensSelecionados(new Set());
}

async function prepararReceitaParaImportacao(
    receita: ReceitaImportada
  ): Promise<Omit<Receita, "tipo" | "criadoEm" | "atualizadoEm">> {
  
    if (!receita.id) {
      throw new Error(
        `A receita "${receita.nome || "sem nome"}" não possui ID e não pode ser importada com segurança.`
      );
    }
  
      const chavePrintsOriginal =
        receita.chavePrintsLegenda || "";

      const imagensPrints =
        (chavePrintsOriginal &&
          printsIndexedDB[chavePrintsOriginal]) ||
        receita.printsLegenda ||
        [];

      if (
        chavePrintsOriginal &&
        imagensPrints.length > 0
      ) {
        await salvarPrintsReceita(
          chavePrintsOriginal,
          imagensPrints
        );
      }

      const ehCarrossel =
        receita.tipoConteudo === "carrossel" || Boolean(receita.carrossel);

  const baseReceita = {
    id: receita.id || "",
    nome: receita.nome || "Receita sem nome",
    categoria: receita.categoria || "sem categoria",
    subCategoria: receita.subCategoria || "",
    ingredientes: Array.isArray(receita.ingredientes)
      ? receita.ingredientes
      : [],
    modoPreparo: Array.isArray(receita.modoPreparo)
      ? receita.modoPreparo
      : [],
    tempo: receita.tempo || "",
    porcoes: receita.porcoes || "",
    imagem: receita.imagem || "",
    video: receita.video || "",
    printsLegenda: Array.isArray(receita.printsLegenda)
      ? receita.printsLegenda
      : [],

    chavePrintsLegenda: receita.chavePrintsLegenda || "",
    
    tags: Array.isArray(receita.tags) ? receita.tags : [],
    resumo: receita.resumo || "",
    origem: receita.origem || "",
    nutricao: receita.nutricao,
    preparacoes: Array.isArray(receita.preparacoes)
      ? receita.preparacoes
      : [],
    favorito: false,
    colecaoInicial: false as const,
    tipoConteudo: "receita" as const,
  };

  if (!ehCarrossel) {
    return baseReceita;
  }

  const chaveOriginal = receita.carrossel?.chaveImagens || "";

  const imagensCarrossel =
    (chaveOriginal && carrosseisIndexedDB[chaveOriginal]) ||
    receita.carrossel?.imagens ||
    [];
  
  if (chaveOriginal && imagensCarrossel.length > 0) {
  await salvarImagensCarrossel(
    chaveOriginal,
    imagensCarrossel
  );
}

  return {
    ...baseReceita,
    tipoConteudo: "carrossel",
    imagem: receita.imagem || imagensCarrossel[0] || "",
    origem: receita.origem || receita.carrossel?.origemUrl || "",
    carrossel: {
      imagens: [],
      titulo: receita.carrossel?.titulo || receita.nome || "",
      origemUrl: receita.carrossel?.origemUrl || receita.origem || "",
      chaveImagens: chaveOriginal,
      quantidadeImagens: imagensCarrossel.length,
},
  };
}
  
async function handleImportarSelecionadas() {
  if (itensSelecionados.size === 0) {
    alert("Selecione pelo menos uma receita para importar.");
    return;
  }

  const quantidadeSelecionada = itensSelecionados.size;

  const confirmar = confirm(
    `Adicionar ${quantidadeSelecionada} item(ns) à Biblioteca Oficial?\n\n` +
      `As receitas serão importadas para revisão, com Coleção Inicial desmarcada.`
  );

  if (!confirmar) return;

  try {
    setImportando(true);
    setMensagemImportacao("");

    const receitasSelecionadas = [...itensSelecionados]
      .sort((a, b) => a - b)
      .map((indice) => receitasImportadas[indice])
      .filter(Boolean);

    const receitasPreparadas = await Promise.all(
      receitasSelecionadas.map((receita) =>
        prepararReceitaParaImportacao(receita)
      )
    );

    const sucesso =
      adicionarReceitasOficiaisEmLote(receitasPreparadas);

    if (sucesso) {
      setMensagemImportacao(
        `✅ ${quantidadeSelecionada} item(ns) adicionado(s) à Biblioteca Oficial.`
      );
      setItensSelecionados(new Set());
    }
  } catch (error) {
    console.error("Erro ao importar receitas:", error);
    alert("Não foi possível concluir a importação selecionada.");
  } finally {
    setImportando(false);
  }
}

  const quantidadeCarrosseis = receitasImportadas.filter(
    (receita) =>
      receita.tipoConteudo === "carrossel" ||
      Boolean(receita.carrossel)
  ).length;

  const quantidadeReceitas =
    receitasImportadas.length - quantidadeCarrosseis;

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/administracao"
            className="inline-block rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 transition hover:border-yellow-500 hover:bg-gray-800"
          >
            ← Voltar para ADM
          </Link>
        </div>

        <div className="rounded-xl border border-gray-700 bg-zinc-900 p-6 shadow-xl">
          <h1 className="mb-3 text-2xl font-bold">
            📥 Importar para Biblioteca Oficial
          </h1>

          <p className="mb-2 text-gray-300">
            Selecione um backup compatível do Receitas Health.
          </p>

          <p className="mb-6 text-sm text-gray-400">
            Nesta etapa o arquivo será apenas analisado. Nenhuma receita
            existente será alterada ou substituída.
          </p>

          <label className="inline-block cursor-pointer rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-500">
            📂 Selecionar arquivo de backup

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleSelecionarArquivo}
              className="hidden"
            />
          </label>

          {nomeArquivo && (
            <p className="mt-4 text-sm text-gray-300">
              Arquivo:{" "}
              <span className="font-semibold text-white">
                {nomeArquivo}
              </span>
            </p>
          )}

          {erro && (
            <div className="mt-5 rounded-lg border border-red-700 bg-red-950 p-4 text-red-200">
              ⚠️ {erro}
            </div>
          )}

          {arquivoValido && (
            <div className="mt-6 rounded-lg border border-green-700 bg-green-950/40 p-4">
              <h2 className="mb-2 text-lg font-semibold text-green-300">
                ✅ Backup válido
              </h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={selecionarTodos}
            className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-600"
          >
            ✓ Selecionar todos
          </button>

          <button
            type="button"
            onClick={desmarcarTodos}
            className="rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white transition hover:bg-gray-600"
          >
            Desmarcar todos
          </button>

          <span className="rounded-lg border border-gray-700 bg-black px-4 py-2 text-sm">
            {itensSelecionados.size} de {receitasImportadas.length} selecionados
          </span>

          <button
            type="button"
            onClick={handleImportarSelecionadas}
            disabled={itensSelecionados.size === 0 || importando}
            className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importando
              ? "Importando..."
              : "📥 Adicionar selecionadas à Biblioteca Oficial"}
          </button>
        </div>
        
          {mensagemImportacao && (
            <div className="mb-4 rounded-lg border border-green-700 bg-green-950/40 p-4 text-green-200">
              {mensagemImportacao}
            </div>
          )}

              <p>
                {receitasImportadas.length === 1
                  ? "1 item encontrado."
                  : `${receitasImportadas.length} itens encontrados.`}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span className="rounded bg-zinc-800 px-3 py-1">
                  {quantidadeReceitas === 1
                    ? "🍲 1 receita"
                    : `🍲 ${quantidadeReceitas} receitas`}
                </span>

                <span className="rounded bg-zinc-800 px-3 py-1">
                  {quantidadeCarrosseis === 1
                    ? "📚 1 carrossel"
                    : `📚 ${quantidadeCarrosseis} carrosséis`}
                </span>
              </div>
            </div>
          )}

          {arquivoValido && receitasImportadas.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-4 text-xl font-bold">
                Conteúdo encontrado
              </h2>

              <div className="space-y-3">
                {receitasImportadas.map((receita, indice) => {
                  const ehCarrossel =
                    receita.tipoConteudo === "carrossel" ||
                    Boolean(receita.carrossel);

                  const quantidadeImagens =
                    receita.carrossel?.quantidadeImagens ??
                    receita.carrossel?.imagens?.length ??
                    0;

                  return (
                    <div
                      key={`${receita.id || "sem-id"}-${indice}`}
                      className={`rounded-lg border p-4 transition ${
                        itensSelecionados.has(indice)
                          ? "border-yellow-400 bg-zinc-900"
                          : "border-gray-700 bg-black"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={itensSelecionados.has(indice)}
                            onChange={() => alternarSelecao(indice)}
                            className="h-5 w-5"
                          />

                          <span className="text-sm text-gray-300">
                            Selecionar
                          </span>
                        </label>
                        
                        <div>
                          <p className="font-semibold">
                            {receita.nome || "Receita sem nome"}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {receita.categoria
                              ? `Categoria: ${receita.categoria}`
                              : "Categoria não informada"}
                          </p>
                        </div>

                        <span className="rounded bg-zinc-800 px-3 py-1 text-sm">
                          {ehCarrossel
                            ? quantidadeImagens === 1
                              ? "📚 Carrossel · 1 imagem"
                              : quantidadeImagens > 1
                                ? `📚 Carrossel · ${quantidadeImagens} imagens`
                                : "📚 Carrossel"
                            : "🍲 Receita"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}