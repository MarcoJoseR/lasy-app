"use client";

// React
import { ChangeEvent, useEffect, useState } from "react";
import { backupCompletoLocalStorage } from "@/app/utils/backupCompletoLocalStorage";

import {
  obterImagensCarrossel,
  salvarImagensCarrossel,
} from "@/app/utils/carrosselIndexedDB";

// ===== INÍCIO DA ALTERAÇÃO =====
import Link from "next/link";
import { useSearchParams } from "next/navigation";
// ===== FIM DA ALTERAÇÃO =====

// Context
import { useReceitas, type Receita } from "../context/ReceitasContext";

// Utils
import { limparTexto } from "@/app/utils/limparTexto";
import { analisarReceitaColada } from "@/app/utils/parserReceita";
import { montarReceita } from "@/app/utils/montarReceita";
import {
  transformarIngredientes,
  transformarPassos,
} from "@/app/utils/receitaHelpers";
import { exportarBackupHomeAdm } from "@/app/utils/exportarHomeAdm";

// Componentes
import Header from "@/app/components/Header";
import FormReceita from "@/app/components/FormReceita";
import ListaReceitas from "@/app/components/ListaReceitas";

import PainelBusca from "@/app/components/PainelBusca";
import PainelCategorias from "@/app/components/PainelCategorias";
import PainelIngredientes from "@/app/components/PainelIngredientes";
import PainelOrdenacao from "@/app/components/PainelOrdenacao";
import BlocoPreparacaoReceita from "@/app/components/BlocoPreparacaoReceita";
import FormularioReceita from "@/app/components/FormularioReceita";
import AvisoEdicao from "@/app/components/AvisoEdicao";
import AcoesFormularioReceita from "@/app/components/AcoesFormularioReceita";
import SecaoTempoRendimento from "@/app/components/SecaoTempoRendimento";
import SecaoIngredientes from "@/app/components/SecaoIngredientes";
import SecaoModoPreparo from "@/app/components/SecaoModoPreparo";
import SecaoDadosGerais from "@/app/components/SecaoDadosGerais";
import SecaoCategorias from "@/app/components/SecaoCategorias";
import { CATEGORIAS_RECEITAS } from "@/app/config/categoriasReceitas";

export default function Page() {
    const [nome, setNome] = useState("");
    const [categoria, setCategoria] = useState("");
    const [imagem, setImagem] = useState("");
    const [ingredientesTexto, setIngredientesTexto] = useState("");
    const [buscaIngredientes, setBuscaIngredientes] = useState("");
    const [modoPreparo, setModoPreparo] = useState("");
    const [tempo, setTempo] = useState("");
    const [busca, setBusca] = useState("");
    const [textoImportado, setTextoImportado] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [erroNome, setErroNome] = useState("");
    const [erroCategoria, setErroCategoria] = useState("");
    const [toast, setToast] = useState("");
    const [mounted, setMounted] = useState(false);
    const [porcoes, setPorcoes] = useState("");
    const LIMITE_RECEITAS_SIMILARES = 5;
    const [ordenacao, setOrdenacao] = useState("recentes");  
    const [subCategoria, setSubCategoria] = useState("");
    const [colecaoInicial, setColecaoInicial] = useState(false);
    
    const [tipoConteudo, setTipoConteudo] = useState<
      "receita" | "carrossel"
    >("receita");

    const [imagensCarrossel, setImagensCarrossel] = useState<string[]>([]);

    const [chaveImagensCarrossel, setChaveImagensCarrossel] =
      useState("");

    const [posicaoImagemY, setPosicaoImagemY] = useState(50);

async function handleBackupCompletoLocalStorage() {
  const resultado = await backupCompletoLocalStorage();

  if (resultado.sucesso) {
    alert(
      `Backup completo criado com sucesso.\n\n` +
        `Arquivo: ${resultado.nomeArquivo}`
    );
  } else {
    alert("Não foi possível criar o backup completo do LocalStorage.");
  }
}

async function handleBackupHomeAdm() {
  const resultado = await exportarBackupHomeAdm();

  if (resultado.sucesso) {
    alert(
      `Backup da Home ADM criado com sucesso.\n\n` +
        `Receitas oficiais: ${resultado.quantidadeReceitas}\n` +
        `Carrosséis com imagens: ${resultado.quantidadeCarrosseis}\n` +
        `Arquivo: ${resultado.nomeArquivo}`
    );
  } else {
    
    alert(
      resultado.mensagem ||
        "Não foi possível criar o backup da Home ADM."
    );
  }
}

    // ===== INÍCIO DA ALTERAÇÃO =====
    const searchParams = useSearchParams();
    const receitaIdEdicao = searchParams.get("id");
// ===== FIM DA ALTERAÇÃO =====

    const {
      receitas,
      carregado,
      adicionarReceita,
      adicionarReceitaOficial,
      removerReceita,
      toggleFavorito,
      atualizarReceita,
    } = useReceitas();

    useEffect(() => {
      setMounted(true);
    }, []);

// ===== INÍCIO DA ALTERAÇÃO =====
useEffect(() => {
  if (!carregado || !receitaIdEdicao) return;

  const receitaEncontrada = receitas.find(
    (receita) =>
      receita.id === receitaIdEdicao &&
      receita.tipo === "oficial"
  );

  if (!receitaEncontrada) return;

  iniciarEdicao(receitaEncontrada);
}, [carregado, receitaIdEdicao, receitas]);

  function removerImagemCarrossel(indice: number) {
    setImagensCarrossel((imagensAtuais) =>
      imagensAtuais.filter((_, index) => index !== indice)
    );
  }

function reduzirImagemCarrossel(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const imagemOriginal = new Image();

      imagemOriginal.onload = () => {
        const limite = 1080;

        let largura = imagemOriginal.width;
        let altura = imagemOriginal.height;

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

        contexto.drawImage(
          imagemOriginal,
          0,
          0,
          largura,
          altura
        );

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      imagemOriginal.onerror = () => {
        reject(
          new Error("Não foi possível carregar a imagem.")
        );
      };

      imagemOriginal.src = String(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Não foi possível ler a imagem."));
    };

    reader.readAsDataURL(file);
  });
}

async function adicionarImagensCarrossel(
  event: ChangeEvent<HTMLInputElement>
) {
  const arquivos = Array.from(event.target.files || []);

  if (arquivos.length === 0) return;

  if (imagensCarrossel.length + arquivos.length > 15) {
    window.alert(
      "O carrossel pode manter no máximo 15 imagens."
    );

    event.target.value = "";
    return;
  }

  try {
    const novasImagens: string[] = [];

    for (const arquivo of arquivos) {
      const imagemProcessada =
        await reduzirImagemCarrossel(arquivo);

      novasImagens.push(imagemProcessada);
    }

    setImagensCarrossel((imagensAtuais) => [
      ...imagensAtuais,
      ...novasImagens,
    ]);

    event.target.value = "";
  } catch (erro) {
    console.error(
      "Erro ao adicionar imagens ao carrossel:",
      erro
    );

    window.alert(
      "Não foi possível adicionar uma ou mais imagens."
    );
  }
}
  
// ===== FIM DA ALTERAÇÃO =====

const normalizarBusca = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[,\.;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ingredientesBusca = normalizarBusca(buscaIngredientes)
  .split(" ")
  .filter((ingrediente) => ingrediente.length >= 2);

  const receitasOficiais = receitas.filter(
  (receita) => receita.tipo === "oficial"
);

const receitasFiltradas = receitasOficiais.filter((receita) => {
  const buscaNome = normalizarBusca(busca);

  const correspondeNome =
  buscaNome.trim().length < 2 ||
  normalizarBusca(receita.nome).includes(normalizarBusca(buscaNome));

  const textoIngredientes = normalizarBusca(
    receita.ingredientes.join(" ")
  );

  const correspondeIngredientes =
    ingredientesBusca.length === 0 ||
    ingredientesBusca.some((ingrediente) =>
      textoIngredientes.includes(ingrediente)
    );

 const correspondeCategoria =
  !filtroCategoria ||
  normalizarBusca(receita.categoria) === normalizarBusca(filtroCategoria);
  
  return (
    correspondeNome &&
    correspondeIngredientes &&
    correspondeCategoria
  );
});

const categorias = CATEGORIAS_RECEITAS;

const ingredientesDigitados = buscaIngredientes
  .toLowerCase()
  .split(/[,\s;]+/)
  .map((item) => item.trim())
  .filter(Boolean);

const receitasPorIngredientes =
  ingredientesDigitados.length === 0
    ? []
    : receitasOficiais
        .map((receita) => {
          const textoIngredientes = receita.ingredientes
            .join(" ")
            .toLowerCase();

          const encontrados = ingredientesDigitados.filter((ingrediente) =>
            textoIngredientes.includes(ingrediente)
          );

          return {
            receita,
            pontos: encontrados.length,
            encontrados,
          };
        })
        .filter((item) => item.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, LIMITE_RECEITAS_SIMILARES);

const receitasOrdenadas = [...receitasFiltradas].sort((a, b) => {
  if (ordenacao === "recentes") {
    return (
      new Date(b.criadoEm || 0).getTime() -
      new Date(a.criadoEm || 0).getTime()
    );
  }

  if (ordenacao === "atualizadas") {
    return (
      new Date(b.atualizadoEm || 0).getTime() -
      new Date(a.atualizadoEm || 0).getTime()
    );
  }

  if (ordenacao === "nome-az") {
    return a.nome.localeCompare(b.nome, "pt-BR");
  }

  if (ordenacao === "nome-za") {
    return b.nome.localeCompare(a.nome, "pt-BR");
  }

  return 0;
});

if (!mounted) return null;

if (!carregado) {
  return (
    <div className="text-white p-4">
      Carregando receitas...
    </div>
  );
}

const handleRemover = (receita: Receita) => {
  if (!confirm(`Excluir "${receita.nome}"?`)) return;

  removerReceita(receita.id);
  setToast(`🗑️ "${receita.nome}" removida`);
  setTimeout(() => {
    setToast("");
  }, 2500);

  // 👉 se estava editando essa receita, limpa o form
  if (editandoId === receita.id) {
    setEditandoId(null);
    setNome("");
    setCategoria("");
    setImagem("");
    setModoPreparo("");
    setTempo("");
    setPorcoes("");
  }
};

const handleFavorito = (receita: Receita) => {
  toggleFavorito(receita.id);
};

// 🧹 Limpar o formulário de importação
function limparImportacao() {
  setEditandoId(null);
  setNome("");
  setCategoria("");
  setSubCategoria("");
  setImagem("");
  setColecaoInicial(false);
  setIngredientesTexto("");
  setModoPreparo("");
  setTempo("");
  setPorcoes("");
  setTextoImportado("");
  setErroNome("");
  setErroCategoria("");
  setTipoConteudo("receita");
  setImagensCarrossel([]);
  setChaveImagensCarrossel("");
}

function iniciarEdicao(r: Receita) {
  setEditandoId(r.id);
  setNome(r.nome || "");
  setCategoria(r.categoria || "");
  setSubCategoria(r.subCategoria || "");
  setColecaoInicial(r.colecaoInicial ?? false);
  setImagem(r.imagem || "");

  setIngredientesTexto(
    r.ingredientes && r.ingredientes.length > 0
      ? r.ingredientes.join("\n")
      : ""
  );

  setModoPreparo(
    Array.isArray(r.modoPreparo)
      ? r.modoPreparo.join("\n")
      : r.modoPreparo || ""
  );

  setTempo(r.tempo || "");
  setPorcoes(r.porcoes || "");

    if (r.tipoConteudo === "carrossel") {
      setTipoConteudo("carrossel");

      const chaveImagens = r.carrossel?.chaveImagens || "";

      setChaveImagensCarrossel(chaveImagens);

      if (chaveImagens) {
        obterImagensCarrossel(chaveImagens)
          .then((imagens) => {
            setImagensCarrossel(imagens);
          })
          .catch((erro) => {
            console.error(
              "Erro ao carregar imagens do carrossel na ADM:",
              erro
            );

            setImagensCarrossel([]);
          });
      } else {
        setImagensCarrossel(
          Array.isArray(r.carrossel?.imagens)
            ? r.carrossel.imagens
            : []
        );
      }
    } else {
      setTipoConteudo("receita");
      setImagensCarrossel([]);
      setChaveImagensCarrossel("");
    }

  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

async function salvarEdicao() {
  if (!editandoId) return;

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

  if (
  tipoConteudo === "carrossel" &&
  imagensCarrossel.length === 0
) {
  window.alert(
    "O carrossel precisa manter pelo menos uma imagem."
  );
  return;
}

if (
  tipoConteudo === "carrossel" &&
  chaveImagensCarrossel
) {
  try {
    await salvarImagensCarrossel(
      chaveImagensCarrossel,
      imagensCarrossel
    );
  } catch (erro) {
    console.error(
      "Erro ao salvar imagens do carrossel na ADM:",
      erro
    );

    window.alert(
      "Não foi possível salvar as imagens do carrossel."
    );

    return;
  }
}

  atualizarReceita(editandoId, {
    nome,
    categoria,
    subCategoria,
    imagem,
    posicaoImagemY,
    ingredientes: transformarIngredientes(ingredientesTexto),
    modoPreparo: transformarPassos(modoPreparo),
    tempo,
    porcoes,
    colecaoInicial,

    ...(tipoConteudo === "carrossel"
  ? {
      tipoConteudo: "carrossel" as const,
      carrossel: {
        imagens: [],
        titulo: nome,
        chaveImagens: chaveImagensCarrossel,
        quantidadeImagens: imagensCarrossel.length,
      },
    }
  : {}),

  });

  limparImportacao();

  setToast("✅ Receita editada com sucesso");

  setTimeout(() => {
    setToast("");
  }, 2500);
}

const inputClass =
  "w-full p-2 border rounded text-black bg-white placeholder-gray-700";

const buttonClass =
  "w-full bg-yellow-400 text-black font-semibold py-2 rounded shadow-md hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50";
  
const buttonCancelClass =
  "w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400 transition";

const inputClassBase =
  "w-full p-2 border rounded bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400";

const inputError = "border-2 border-red-500 ring-1 ring-red-400";

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      {toast && (
  <div className="fixed top-20 right-5 z-50 animate-in fade-in slide-in-from-top duration-300">
    <div className="bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-yellow-400">
      {toast}
    </div>
  </div>
)}
      
<Header />

<div className="mb-4 flex flex-wrap justify-end gap-3">
  <Link
    href="/administracao/importar-biblioteca"
    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white transition hover:border-yellow-500 hover:bg-gray-800"
  >
    📥 Importar para Biblioteca Oficial
  </Link>

<Link
  href="/administracao/restaurar-backup"
  className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white transition hover:border-red-500 hover:bg-gray-800"
>
  ♻️ Restaurar Backup Home ADM
</Link>

  <button
    type="button"
    onClick={handleBackupCompletoLocalStorage}
    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white transition hover:border-green-500 hover:bg-gray-800"
  >
    💾 Backup Completo
  </button>

  <button
    type="button"
    onClick={handleBackupHomeAdm}
    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white transition hover:border-green-500 hover:bg-gray-800"
  >
    💾 Backup Home ADM
  </button>

</div>

<BlocoPreparacaoReceita
  onLimparPreparacao={limparImportacao}
/>

<FormReceita>

  <FormularioReceita>

    <AvisoEdicao editando={Boolean(editandoId)} />

    <SecaoDadosGerais
      nome={nome}
      setNome={setNome}
      imagem={imagem}
      setImagem={setImagem}
      posicaoImagemY={posicaoImagemY}
      setPosicaoImagemY={setPosicaoImagemY}
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
      
<div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
  <h3 className="mb-3 text-lg font-semibold text-white">
    Classificação da receita
  </h3>

  <label className="flex cursor-pointer items-center gap-3 text-white">
    <input
      type="checkbox"
      checked={colecaoInicial}
      onChange={(e) => setColecaoInicial(e.target.checked)}
      className="h-5 w-5"
    />

    <span>Incluir na Coleção Inicial</span>
  </label>

  <p className="mt-2 text-sm text-gray-400">
    Marque apenas receitas revisadas e preparadas para representar a qualidade do aplicativo.
  </p>
</div>

{tipoConteudo === "carrossel" && imagensCarrossel.length > 0 && (
  <div className="rounded-lg border border-emerald-700 bg-zinc-900 p-4">
    <h3 className="mb-2 text-lg font-semibold text-emerald-300">
      📚 Carrossel com {imagensCarrossel.length}{" "}
      {imagensCarrossel.length === 1 ? "imagem" : "imagens"}
    </h3>

    <p className="mb-4 text-sm text-zinc-400">
      Imagens armazenadas no carrossel.
    </p>

  <div className="mb-4">
    <label className="mb-2 block text-sm font-semibold text-white">
      Adicionar imagens ao carrossel
    </label>

    <input
      type="file"
      accept="image/*"
      multiple
      onChange={adicionarImagensCarrossel}
      className="block w-full rounded-lg bg-zinc-800 p-3 text-sm text-white"
    />

    <p className="mt-2 text-xs text-zinc-400">
      Máximo de 15 imagens no carrossel.
    </p>
  </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {imagensCarrossel.map((imagemCarrossel, indice) => (
        <div
          key={indice}
          className="overflow-hidden rounded-lg bg-zinc-800"
        >
          <img
            src={imagemCarrossel}
            alt={`Imagem ${indice + 1} do carrossel`}
            className="aspect-square w-full object-cover"
          />

          <div className="p-2">
            <p className="mb-2 text-center text-xs text-zinc-300">
              {indice + 1}/{imagensCarrossel.length}
            </p>

            <button
              type="button"
              onClick={() => removerImagemCarrossel(indice)}
              className="w-full rounded bg-red-700 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    <SecaoTempoRendimento
      tempo={tempo}
      porcoes={porcoes}
      inputClass={inputClass}
      setTempo={setTempo}
      setPorcoes={setPorcoes}
    />

    <h3 className="mt-6 mb-4 text-lg font-bold text-zinc-900">
      🍳 Receita
    </h3>

    <SecaoIngredientes
      ingredientesTexto={ingredientesTexto}
      setIngredientesTexto={setIngredientesTexto}
    />

    <SecaoModoPreparo
      modoPreparo={modoPreparo}
      setModoPreparo={setModoPreparo}
    />

    <AcoesFormularioReceita
      editando={Boolean(editandoId)}
      onConfirmar={() => {
        if (editandoId) {
          salvarEdicao();
        } else {
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

          adicionarReceitaOficial({
            ...montarReceita({
              id: crypto.randomUUID(),
              nome,
              categoria,
              subCategoria,
              imagem,
              ingredientesTexto,
              modoPreparoTexto: modoPreparo,
              tempo,
              porcoes,
              favorito: false,
            }),

            colecaoInicial,
            });

          limparImportacao();

          setToast("🍳 Receita adicionada com sucesso");

          setTimeout(() => {
            setToast("");
          }, 2500);
        }
      }}
      onCancelar={limparImportacao}
    />
    </FormularioReceita>

 </FormReceita>

<PainelBusca
    busca={busca}
    setBusca={setBusca}
    total={receitasFiltradas.length}
/>


<PainelCategorias
  filtroCategoria={filtroCategoria}
  setFiltroCategoria={setFiltroCategoria}
  categorias={categorias}
/>

<PainelOrdenacao
  ordenacao={ordenacao}
  setOrdenacao={setOrdenacao}
/>

<PainelIngredientes
  buscaIngredientes={buscaIngredientes}
  setBuscaIngredientes={setBuscaIngredientes}
  receitasPorIngredientes={receitasPorIngredientes}
/>

    <ListaReceitas
  receitasFiltradas={receitasOrdenadas}
  totalReceitas={receitasOficiais.length}
  categorias={categorias}
  handleFavorito={handleFavorito}
  handleRemover={handleRemover}
  iniciarEdicao={iniciarEdicao}
  editandoId={editandoId}
/>
  
</div>
);
}