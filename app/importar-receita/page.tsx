"use client";

import { ChangeEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type TipoImportacao = "receita" | "carrossel";

export default function ImportarReceitaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const url = searchParams.get("url") || "";

  const textoLimpo = text.trim();

  const urlEncontradaNoTexto =
    textoLimpo.match(/https?:\/\/[^\s]+/i)?.[0] || "";

  const linkRecebido =
    url.trim() || urlEncontradaNoTexto;

  const textoParaAnalisar = urlEncontradaNoTexto
    ? textoLimpo.replace(urlEncontradaNoTexto, "").trim()
    : textoLimpo;

  const [tipoImportacao, setTipoImportacao] =
    useState<TipoImportacao>("receita");

  const [imagensCarrossel, setImagensCarrossel] = useState<string[]>([]);
  const [nomesImagens, setNomesImagens] = useState<string[]>([]);
  const [processandoImagens, setProcessandoImagens] = useState(false);
  const [erroCarrossel, setErroCarrossel] = useState("");

  // ============================================================
  // RECEITA EM TEXTO
  // SEPARAÇÃO DO TEXTO RECEBIDO
  // ============================================================

  let ingredientes = "";
  let modoPreparo = "";

  const linhas = textoParaAnalisar.split("\n");

  const indiceIngredientes = linhas.findIndex((linha) => {
    const texto = linha
      .trim()
      .replace(/^[^A-Za-zÀ-ÿ]*/, "")
      .toLowerCase();

    return texto === "ingredientes" || texto === "ingredientes:";
  });

  const indicePreparo = linhas.findIndex((linha) => {
    const texto = linha.trim().toLowerCase();

    return (
      texto.includes("modo de preparo") ||
      texto.includes("modo de fazer")
    );
  });

  if (
    indiceIngredientes !== -1 &&
    indicePreparo !== -1 &&
    indicePreparo > indiceIngredientes
  ) {
    ingredientes = linhas
      .slice(indiceIngredientes + 1, indicePreparo)
      .join("\n")
      .trim();
  }

  if (
  indiceIngredientes === -1 &&
  indicePreparo === -1 &&
  textoParaAnalisar
) {
  ingredientes = textoParaAnalisar;
}

  if (indicePreparo !== -1) {
    modoPreparo = linhas
      .slice(indicePreparo + 1)
      .join("\n")
      .trim();
  }

// ============================================================
// FALLBACK FINAL - PRESERVAR CONTEÚDO
// ============================================================

// Nunca tratar links compartilhados como ingredientes
ingredientes = ingredientes
  .replace(/https?:\/\/[^\s]+/gi, "")
  .trim();

  // ============================================================
  // TRANSFERÊNCIA DA RECEITA EM TEXTO PARA O FORMULÁRIO
  // ============================================================

  function continuarParaFormulario() {
    const dadosImportados = {
      nome: title,
      ingredientesTexto: ingredientes,
      modoPreparoTexto: modoPreparo,
      origem: linkRecebido,
      video: linkRecebido,
    };

    sessionStorage.setItem(
      "receitaImportadaPendente",
      JSON.stringify(dadosImportados)
    );

    router.push("/minha-receita?importar=1");
  }

  // ============================================================
  // CARROSSEL
  // REDUZIR IMAGEM ANTES DE ARMAZENAR
  // ============================================================

  function reduzirImagem(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const imagem = new Image();

        imagem.onload = () => {
          const limite = 1080;

          let largura = imagem.width;
          let altura = imagem.height;

          if (largura > limite || altura > limite) {
            const proporcao = Math.min(
              limite / largura,
              limite / altura
            );

            largura = Math.round(largura * proporcao);
            altura = Math.round(altura * proporcao);
          }

          const canvas = document.createElement("canvas");

          canvas.width = largura;
          canvas.height = altura;

          const contexto = canvas.getContext("2d");

          if (!contexto) {
            reject(new Error("Não foi possível processar a imagem."));
            return;
          }

          contexto.drawImage(imagem, 0, 0, largura, altura);

          const imagemReduzida = canvas.toDataURL(
            "image/jpeg",
            0.78
          );

          resolve(imagemReduzida);
        };

        imagem.onerror = () => {
          reject(new Error("Não foi possível carregar a imagem."));
        };

        imagem.src = String(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("Não foi possível ler o arquivo."));
      };

      reader.readAsDataURL(file);
    });
  }

  // ============================================================
  // SELEÇÃO DAS IMAGENS DO CARROSSEL
  // ============================================================

  async function selecionarImagensCarrossel(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setErroCarrossel("");

    const arquivos = Array.from(event.target.files || []);

    if (arquivos.length === 0) {
      setImagensCarrossel([]);
      setNomesImagens([]);
      return;
    }

    if (arquivos.length > 15) {
      setErroCarrossel(
        "Selecione no máximo 15 imagens para o carrossel."
      );

      event.target.value = "";
      return;
    }

    setProcessandoImagens(true);

    try {
      const imagensProcessadas: string[] = [];

      for (const arquivo of arquivos) {
        const imagem = await reduzirImagem(arquivo);
        imagensProcessadas.push(imagem);
      }

      setImagensCarrossel(imagensProcessadas);
      setNomesImagens(arquivos.map((arquivo) => arquivo.name));
    } catch (erro) {
      console.error(erro);

      setImagensCarrossel([]);
      setNomesImagens([]);

      setErroCarrossel(
        "Não foi possível preparar uma ou mais imagens."
      );
    } finally {
      setProcessandoImagens(false);
    }
  }

  // ============================================================
  // TRANSFERÊNCIA DO CARROSSEL PARA O FORMULÁRIO
  // ============================================================

  function continuarCarrosselParaFormulario() {
    if (imagensCarrossel.length === 0) {
      setErroCarrossel(
        "Selecione pelo menos uma imagem para o carrossel."
      );
      return;
    }

    const dadosCarrossel = {
      nome: title,
      origem: linkRecebido,
      video: linkRecebido,

      tipoConteudo: "carrossel" as const,

      carrossel: {
        imagens: imagensCarrossel,
        titulo: title,
        origemUrl: linkRecebido,
      },
    };

    try {
      sessionStorage.setItem(
        "carrosselImportadoPendente",
        JSON.stringify(dadosCarrossel)
      );

      router.push("/minha-receita?importarCarrossel=1");
    } catch (erro) {
      console.error(erro);

      setErroCarrossel(
        "O conjunto de imagens ficou grande demais para ser transferido. Reduza a quantidade de imagens e tente novamente."
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">
        📥 Importar Receita
      </h1>

      {/* ======================================================
          ESCOLHA DO TIPO DE CONTEÚDO
      ====================================================== */}

      <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <p className="mb-3 font-semibold">
          O que você deseja importar?
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTipoImportacao("receita")}
            className={`rounded-lg px-4 py-3 font-semibold ${
              tipoImportacao === "receita"
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-800 text-white"
            }`}
          >
            📝 Receita em texto
          </button>

          <button
            type="button"
            onClick={() => setTipoImportacao("carrossel")}
            className={`rounded-lg px-4 py-3 font-semibold ${
              tipoImportacao === "carrossel"
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-800 text-white"
            }`}
          >
            📚 Carrossel de imagens
          </button>
        </div>
      </div>

      {/* ======================================================
          RECEITA EM TEXTO
      ====================================================== */}

      {tipoImportacao === "receita" && (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-zinc-400">
              Título recebido
            </p>

            <div className="rounded-lg bg-zinc-900 p-3">
              {title || "Nenhum título recebido"}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold text-zinc-400">
              Texto recebido
            </p>

            <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3">
              {text || "Nenhum texto recebido"}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold text-green-400">
              Ingredientes identificados
            </p>

            <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3">
              {ingredientes || "Ingredientes não identificados"}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold text-green-400">
              Modo de Preparo identificado
            </p>

            <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3">
              {modoPreparo || "Modo de Preparo não identificado"}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold text-zinc-400">
              Link recebido
            </p>

            <div className="break-all rounded-lg bg-zinc-900 p-3">
              {linkRecebido || "Nenhum link recebido"}
            </div>
          </div>

          <button
            type="button"
            onClick={continuarParaFormulario}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Continuar para o formulário
          </button>
        </div>
      )}

      {/* ======================================================
          CARROSSEL DE IMAGENS
      ====================================================== */}

      {tipoImportacao === "carrossel" && (
        <div className="space-y-5">
          <div className="rounded-lg bg-zinc-900 p-4">
            <p className="mb-1 text-sm font-semibold text-zinc-400">
              Título recebido
            </p>

            <p>{title || "O nome poderá ser informado no formulário"}</p>
          </div>

          <div className="rounded-lg bg-zinc-900 p-4">
            <p className="mb-1 text-sm font-semibold text-zinc-400">
              Link de origem
            </p>

            <p className="break-all">
              {linkRecebido || "Nenhum link recebido"}
            </p>
          </div>

          <div>
            <label
              htmlFor="imagensCarrossel"
              className="mb-2 block font-semibold"
            >
              📚 Selecionar imagens do carrossel
            </label>

            <input
              id="imagensCarrossel"
              type="file"
              accept="image/*"
              multiple
              onChange={selecionarImagensCarrossel}
              className="block w-full rounded-lg bg-zinc-900 p-3"
            />

            <p className="mt-2 text-sm text-zinc-400">
              Selecione as imagens na ordem em que deseja vê-las.
              Máximo: 15 imagens.
            </p>
          </div>

          {processandoImagens && (
            <div className="rounded-lg bg-zinc-900 p-3 text-amber-400">
              Preparando imagens...
            </div>
          )}

          {erroCarrossel && (
            <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-red-300">
              {erroCarrossel}
            </div>
          )}

          {imagensCarrossel.length > 0 && (
            <div>
              <p className="mb-3 font-semibold text-green-400">
                📚 {imagensCarrossel.length}{" "}
                {imagensCarrossel.length === 1
                  ? "imagem selecionada"
                  : "imagens selecionadas"}
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imagensCarrossel.map((imagem, indice) => (
                  <div
                    key={`${nomesImagens[indice]}-${indice}`}
                    className="overflow-hidden rounded-lg bg-zinc-900"
                  >
                    <img
                      src={imagem}
                      alt={`Imagem ${indice + 1} do carrossel`}
                      className="aspect-square w-full object-cover"
                    />

                    <div className="p-2">
                      <p className="text-sm font-semibold">
                        {indice + 1}/{imagensCarrossel.length}
                      </p>

                      <p className="truncate text-xs text-zinc-400">
                        {nomesImagens[indice]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                A primeira imagem será usada como capa.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={continuarCarrosselParaFormulario}
            disabled={
              imagensCarrossel.length === 0 ||
              processandoImagens
            }
            className={`w-full rounded-lg px-4 py-3 font-semibold ${
              imagensCarrossel.length > 0 &&
              !processandoImagens
                ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                : "cursor-not-allowed bg-zinc-700 text-zinc-400"
            }`}
          >
            Continuar com o Carrossel
          </button>
        </div>
      )}
    </main>
  );
}