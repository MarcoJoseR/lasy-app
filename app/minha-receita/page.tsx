"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import BlocoCriarReceita from "@/app/components/BlocoCriarReceita";
import FormReceita from "@/app/components/FormReceita";
import FormularioReceita from "@/app/components/FormularioReceita";
import SecaoDadosGerais from "@/app/components/SecaoDadosGerais";
import SecaoCategorias from "@/app/components/SecaoCategorias";
import SecaoTempoRendimento from "@/app/components/SecaoTempoRendimento";
import SecaoIngredientes from "@/app/components/SecaoIngredientes";
import SecaoModoPreparo from "@/app/components/SecaoModoPreparo";
import AcoesMinhaReceita from "@/app/components/AcoesMinhaReceita";
import { useReceitas } from "@/app/context/ReceitasContext";
import { CATEGORIAS_RECEITAS } from "@/app/config/categoriasReceitas";

import { limparTexto } from "@/app/utils/limparTexto";
import { montarReceita } from "@/app/utils/montarReceita";
import { gerarId } from "@/app/utils/gerarId";
import BotaoVoltar from "@/app/components/BotaoVoltar";

export default function MinhaReceitaPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [imagem, setImagem] = useState("");
  const [erroNome, setErroNome] = useState("");

  const [categoria, setCategoria] = useState("");
  const [subCategoria, setSubCategoria] = useState("");
  const [erroCategoria, setErroCategoria] = useState("");

  const categorias = CATEGORIAS_RECEITAS;

  const inputClassBase =
    "mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-emerald-600";

  const inputError = "border-rose-700";

  const [tempo, setTempo] = useState("");
  const [porcoes, setPorcoes] = useState("");
  const [origem, setOrigem] = useState("");
  const [video, setVideo] = useState("");

  const [ingredientesTexto, setIngredientesTexto] = useState("");
  const [modoPreparo, setModoPreparo] = useState("");

  // ============================================================
  // CARROSSEL
  // ============================================================

  const [tipoConteudo, setTipoConteudo] = useState<
    "receita" | "carrossel"
  >("receita");

  const [imagensCarrossel, setImagensCarrossel] = useState<string[]>(
    []
  );
  // ============================================================
  // PRINTS DA LEGENDA
  // ============================================================

  const [printsLegenda, setPrintsLegenda] = useState<string[]>([]);
  const [nomesPrintsLegenda, setNomesPrintsLegenda] = useState<string[]>([]);
  const [processandoPrints, setProcessandoPrints] = useState(false);
  const [erroPrints, setErroPrints] = useState("");

  const {
    receitas,
    adicionarReceita,
    atualizarReceita,
    carregado,
  } = useReceitas();

  const searchParams = useSearchParams();
  const receitaId = searchParams.get("id");

// ============================================================
// REDUZIR PRINT ANTES DE ARMAZENAR
// ============================================================

function reduzirPrint(file: File): Promise<string> {
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
          reject(
            new Error("Não foi possível processar a imagem.")
          );
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
        reject(
          new Error("Não foi possível carregar a imagem.")
        );
      };

      imagem.src = String(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Não foi possível ler o arquivo."));
    };

    reader.readAsDataURL(file);
  });
}

async function selecionarPrintsLegenda(
  event: ChangeEvent<HTMLInputElement>
) {
  setErroPrints("");

  const arquivos = Array.from(event.target.files || []);

  if (arquivos.length === 0) {
    return;
  }

  if (arquivos.length > 4) {
    setErroPrints(
      "Selecione no máximo 4 prints da legenda."
    );

    event.target.value = "";
    return;
  }

  setProcessandoPrints(true);

  try {
    const imagensProcessadas: string[] = [];

    for (const arquivo of arquivos) {
      const imagem = await reduzirPrint(arquivo);
      imagensProcessadas.push(imagem);
    }

    setPrintsLegenda(imagensProcessadas);
    setNomesPrintsLegenda(
      arquivos.map((arquivo) => arquivo.name)
    );
  } catch (erro) {
    console.error(erro);

    setPrintsLegenda([]);
    setNomesPrintsLegenda([]);

    setErroPrints(
      "Não foi possível preparar um ou mais prints."
    );
  } finally {
    setProcessandoPrints(false);
  }
}
  // ============================================================
  // CARREGAR RECEITA PARA EDIÇÃO
  // ============================================================

  useEffect(() => {
    if (!carregado || !receitaId) return;

    const receitaEncontrada = receitas.find(
      (receita) => receita.id === receitaId
    );

    if (!receitaEncontrada) return;

    console.log(
      "Receita carregada para edição:",
      receitaEncontrada
    );

    setNome(receitaEncontrada.nome || "");
    setImagem(receitaEncontrada.imagem || "");
    setCategoria(receitaEncontrada.categoria || "");
    setSubCategoria(receitaEncontrada.subCategoria || "");
    setTempo(receitaEncontrada.tempo || "");
    setPorcoes(receitaEncontrada.porcoes || "");
    setOrigem(receitaEncontrada.origem || "");
    setVideo(receitaEncontrada.video || "");

    setPrintsLegenda(
      Array.isArray(receitaEncontrada.printsLegenda)
        ? receitaEncontrada.printsLegenda
        : []
    );

    setNomesPrintsLegenda([]);

    setIngredientesTexto(
      Array.isArray(receitaEncontrada.ingredientes)
        ? receitaEncontrada.ingredientes.join("\n")
        : ""
    );

    setModoPreparo(
      Array.isArray(receitaEncontrada.modoPreparo)
        ? receitaEncontrada.modoPreparo.join("\n")
        : receitaEncontrada.modoPreparo || ""
    );

    // ==========================================================
    // CARREGAR DADOS DE CARROSSEL EXISTENTE
    // ==========================================================

    if (receitaEncontrada.tipoConteudo === "carrossel") {
      setTipoConteudo("carrossel");

      setImagensCarrossel(
        Array.isArray(receitaEncontrada.carrossel?.imagens)
          ? receitaEncontrada.carrossel.imagens
          : []
      );
    } else {
      setTipoConteudo("receita");
      setImagensCarrossel([]);
    }
  }, [carregado, receitaId, receitas]);

  // ============================================================
  // RECEBER DADOS DA IMPORTAÇÃO DE RECEITA EM TEXTO
  // ============================================================

  useEffect(() => {
    const importar = searchParams.get("importar");

    if (importar !== "1") return;

    const dadosSalvos = sessionStorage.getItem(
      "receitaImportadaPendente"
    );

    if (!dadosSalvos) return;

    try {
      const dadosImportados = JSON.parse(dadosSalvos);

      setNome(dadosImportados.nome || "");
      setIngredientesTexto(
        dadosImportados.ingredientesTexto || ""
      );
      setModoPreparo(dadosImportados.modoPreparoTexto || "");
      setOrigem(dadosImportados.origem || "");
      setVideo(dadosImportados.video || "");

      setTipoConteudo("receita");
      setImagensCarrossel([]);

      sessionStorage.removeItem("receitaImportadaPendente");
    } catch (error) {
      console.error(
        "Erro ao carregar receita importada:",
        error
      );
    }
  }, [searchParams]);

  // ============================================================
  // RECEBER DADOS DA IMPORTAÇÃO DE CARROSSEL
  // ============================================================

  useEffect(() => {
    const importarCarrossel =
      searchParams.get("importarCarrossel");

    if (importarCarrossel !== "1") return;

    const dadosSalvos = sessionStorage.getItem(
      "carrosselImportadoPendente"
    );

    if (!dadosSalvos) return;

    try {
      const dadosImportados = JSON.parse(dadosSalvos);

      const imagens =
        Array.isArray(dadosImportados.carrossel?.imagens)
          ? dadosImportados.carrossel.imagens
          : [];

      setNome(dadosImportados.nome || "");
      setOrigem(dadosImportados.origem || "");
      setVideo(dadosImportados.video || "");

      setTipoConteudo("carrossel");
      setImagensCarrossel(imagens);

      // A primeira imagem do Carrossel será também a capa
      setImagem(imagens[0] || "");

      // Carrossel não precisa nascer com ingredientes
      // nem modo de preparo preenchidos
      setIngredientesTexto("");
      setModoPreparo("");

      sessionStorage.removeItem(
        "carrosselImportadoPendente"
      );
    } catch (error) {
      console.error(
        "Erro ao carregar carrossel importado:",
        error
      );
    }
  }, [searchParams]);

  const [mensagemSucesso, setMensagemSucesso] =
    useState("");

  // ============================================================
  // LIMPAR FORMULÁRIO
  // ============================================================

  function limparFormulario() {
    setNome("");
    setCategoria("");
    setSubCategoria("");
    setImagem("");
    setTempo("");
    setPorcoes("");
    setOrigem("");
    setIngredientesTexto("");
    setModoPreparo("");
    setVideo("");
    setTipoConteudo("receita");
    setImagensCarrossel([]);
    setPrintsLegenda([]);
    setNomesPrintsLegenda([]);
    setErroPrints("");

    setErroNome("");
    setErroCategoria("");
    setMensagemSucesso("");
  }

  // ============================================================
  // SALVAR RECEITA
  // ============================================================

  function salvarReceita() {
    console.log("salvarReceita executada", {
      nome,
      categoria,
      receitaId,
      tipoConteudo,
      imagensCarrossel: imagensCarrossel.length,
    });

    setErroNome("");
    setErroCategoria("");

    if (!nome.trim()) {
      setErroNome("Insira o nome da receita");
      return;
    }

    if (!categoria) {
      setErroCategoria("Selecione uma categoria");
      return;
    }

    const agora = new Date().toISOString();

    // ==========================================================
    // EDITAR RECEITA EXISTENTE
    // ==========================================================

    if (receitaId) {
      const receitaExistente = receitas.find(
        (receita) => receita.id === receitaId
      );

      if (!receitaExistente) {
        return;
      }

      const receitaAtualizada = {
        ...montarReceita({
          id: receitaId,
          nome,
          categoria,
          subCategoria,
          imagem,
          ingredientesTexto,
          modoPreparoTexto: modoPreparo,
          tempo,
          porcoes,
          origem,
          video,
          printsLegenda,
          favorito: receitaExistente.favorito,
        }),

        // Preservar os campos específicos de Carrossel
        ...(tipoConteudo === "carrossel"
          ? {
              tipoConteudo: "carrossel" as const,

              carrossel: {
                imagens: imagensCarrossel,
                titulo: nome,
                origemUrl: origem,
              },
            }
          : {}),

        atualizadoEm: agora,
      };

      atualizarReceita(receitaId, receitaAtualizada);

      setMensagemSucesso(
        "Receita atualizada com sucesso"
      );
    } else {
      // ========================================================
      // CRIAR NOVA RECEITA
      // ========================================================

      const novaReceitaId = gerarId();

      const novaReceita = {
        ...montarReceita({
          id: novaReceitaId,
          nome,
          categoria,
          subCategoria,
          imagem,
          ingredientesTexto,
          modoPreparoTexto: modoPreparo,
          tempo,
          porcoes,
          origem,
          video,
          printsLegenda,
          favorito: false,
        }),

        // ======================================================
        // CAMPOS EXCLUSIVOS DO CARROSSEL
        // ======================================================

        ...(tipoConteudo === "carrossel"
          ? {
              tipoConteudo: "carrossel" as const,

              carrossel: {
                imagens: imagensCarrossel,
                titulo: nome,
                origemUrl: origem,
              },
            }
          : {}),
      };

      adicionarReceita(novaReceita);

      router.push("/favoritos");
      return;
    }

    setNome("");
    setCategoria("");
    setSubCategoria("");
    setImagem("");
    setTempo("");
    setPorcoes("");
    setOrigem("");
    setIngredientesTexto("");
    setModoPreparo("");

    setTipoConteudo("receita");
    setImagensCarrossel([]);
    setPrintsLegenda([]);
    setNomesPrintsLegenda([]);
    setErroPrints("");


    setErroNome("");
    setErroCategoria("");

    setTimeout(() => {
      setMensagemSucesso("");
    }, 4000);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <BotaoVoltar />

        <BlocoCriarReceita editando={receitaId !== null} />

        {/* ====================================================
            AVISO DE CARROSSEL IMPORTADO
        ==================================================== */}

        {tipoConteudo === "carrossel" &&
          imagensCarrossel.length > 0 && (
            <div className="mb-4 rounded-lg border border-emerald-700 bg-zinc-900 px-4 py-3">
              <p className="font-semibold text-emerald-300">
                📚 Carrossel com {imagensCarrossel.length}{" "}
                {imagensCarrossel.length === 1
                  ? "imagem"
                  : "imagens"}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                A primeira imagem será usada como capa.
              </p>
            </div>
          )}

        <div className="-mt-4 mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1">
            {mensagemSucesso && (
              <div className="rounded-lg border-2 border-emerald-500 bg-zinc-900 px-4 py-3 text-base font-bold text-emerald-300 shadow-lg">
                ✅ {mensagemSucesso}
              </div>
            )}
          </div>

          <AcoesMinhaReceita
            onSalvar={salvarReceita}
            onLimpar={limparFormulario}
            editando={Boolean(receitaId)}
          />
        </div>

      {origem && (
        <div className="mb-4 rounded-lg border border-emerald-700 bg-zinc-900 p-4">
          <p className="mb-1 text-sm font-semibold text-emerald-300">
            🔗 Link de origem recebido
          </p>

          <p className="break-all text-sm text-zinc-300">
            {origem}
          </p>
        </div>
      )}

        <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="mb-2 font-semibold text-white">
            📄 Prints da legenda
          </p>

          <p className="mb-3 text-sm text-zinc-400">
            Se a receita estiver escrita na legenda da publicação,
            faça prints do texto e anexe aqui. Você pode selecionar
            até 4 imagens.
          </p>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={selecionarPrintsLegenda}
            className="block w-full rounded-lg bg-zinc-800 p-3"
          />

          {processandoPrints && (
            <p className="mt-3 text-sm text-amber-400">
              Preparando prints...
            </p>
          )}

          {erroPrints && (
            <div className="mt-3 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300">
              {erroPrints}
            </div>
          )}

          {printsLegenda.length > 0 && (
            <div className="mt-4">
              <p className="mb-3 font-semibold text-emerald-300">
                {printsLegenda.length}{" "}
                {printsLegenda.length === 1
                  ? "print anexado"
                  : "prints anexados"}
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {printsLegenda.map((imagem, indice) => (
                  <div
                    key={`${nomesPrintsLegenda[indice] || "print"}-${indice}`}
                    className="overflow-hidden rounded-lg bg-zinc-800"
                  >
                    <img
                      src={imagem}
                      alt={`Print da legenda ${indice + 1}`}
                      className="aspect-square w-full object-cover"
                    />

                    <div className="p-2 text-center text-xs text-zinc-300">
                      {indice + 1}/{printsLegenda.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <FormReceita>
          <FormularioReceita>
            <SecaoDadosGerais
              nome={nome}
              setNome={setNome}
              imagem={imagem}
              setImagem={setImagem}
              permitirUploadImagem={true}
              erroNome={erroNome}
              setErroNome={setErroNome}
              limparTexto={limparTexto}
              inputClassBase={inputClassBase}
              inputError={inputError}
            />

            <SecaoCategorias
              categoria={categoria}
              setCategoria={setCategoria}
              subCategoria={subCategoria}
              setSubCategoria={setSubCategoria}
              erroCategoria={erroCategoria}
              setErroCategoria={setErroCategoria}
              categorias={categorias}
              inputClassBase={inputClassBase}
            />

            <SecaoTempoRendimento
              tempo={tempo}
              porcoes={porcoes}
              inputClass={inputClassBase}
              setTempo={setTempo}
              setPorcoes={setPorcoes}
            />

            <SecaoIngredientes
              ingredientesTexto={ingredientesTexto}
              setIngredientesTexto={setIngredientesTexto}
            />

            <SecaoModoPreparo
              modoPreparo={modoPreparo}
              setModoPreparo={setModoPreparo}
            />
          </FormularioReceita>
        </FormReceita>
      </div>
    </main>
  );
}