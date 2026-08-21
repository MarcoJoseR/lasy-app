"use client";

// React
import { useEffect, useState } from "react";
import { backupCompletoLocalStorage } from "@/app/utils/backupCompletoLocalStorage";

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

  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function salvarEdicao() {
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

  atualizarReceita(editandoId, {
    nome,
    categoria,
    subCategoria,
    imagem,
    ingredientes: transformarIngredientes(ingredientesTexto),
    modoPreparo: transformarPassos(modoPreparo),
    tempo,
    porcoes,
    colecaoInicial,
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

<div className="mb-4 flex justify-end">
  <button
    type="button"
    onClick={handleBackupCompletoLocalStorage}
    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white transition hover:border-green-500 hover:bg-gray-800"
  >
    💾 Backup Completo
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
  totalReceitas={receitas.length}
  categorias={categorias}
  handleFavorito={handleFavorito}
  handleRemover={handleRemover}
  iniciarEdicao={iniciarEdicao}
  editandoId={editandoId}
/>
  
</div>
);
}