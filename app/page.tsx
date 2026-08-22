"use client";

// React
import { useEffect, useState } from "react";

// Context
import { useReceitas, type Receita } from "@/app/context/ReceitasContext";


// Componentes
import Header from "@/app/components/Header";
import ListaReceitas from "@/app/components/ListaReceitas";
import PainelBusca from "@/app/components/PainelBusca";
import PainelCategorias from "@/app/components/PainelCategorias";
import PainelIngredientes from "@/app/components/PainelIngredientes";
import PainelOrdenacao from "@/app/components/PainelOrdenacao";
import { useRouter } from "next/navigation";
import { CATEGORIAS_RECEITAS } from "@/app/config/categoriasReceitas";

export default function Page() {
    
    const [buscaIngredientes, setBuscaIngredientes] = useState("");
    const [busca, setBusca] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [toast, setToast] = useState("");
    const [mounted, setMounted] = useState(false);
    const LIMITE_RECEITAS_SIMILARES = 5;
    const [ordenacao, setOrdenacao] = useState("recentes");  
    const router = useRouter();

    const {
      receitas,
      carregado,
      removerReceita,
      toggleFavorito,
    } = useReceitas();

    useEffect(() => {
  const deveRestaurar =
    sessionStorage.getItem("restaurarHomePesquisa") === "1";

  if (deveRestaurar) {
    const estadoSalvo =
      sessionStorage.getItem("estadoHomePesquisa");

    if (estadoSalvo) {
      try {
        const estado = JSON.parse(estadoSalvo);

        setBusca(estado.busca || "");
        setBuscaIngredientes(estado.buscaIngredientes || "");
        setFiltroCategoria(estado.filtroCategoria || "");
        setOrdenacao(estado.ordenacao || "recentes");

        if (typeof estado.scrollY === "number") {
          sessionStorage.setItem(
            "scrollHomePesquisa",
            String(estado.scrollY)
          );
        }
       } catch {
        // Se o estado salvo estiver inválido,
        // simplesmente abre a pesquisa normalmente.
      }
    }

    sessionStorage.removeItem("restaurarHomePesquisa");
  }

  setMounted(true);
}, []);

useEffect(() => {
  if (!mounted || !carregado) return;

  const scrollSalvo =
    sessionStorage.getItem("scrollHomePesquisa");

  if (!scrollSalvo) return;

  const posicao = Number(scrollSalvo);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, posicao);
      sessionStorage.removeItem("scrollHomePesquisa");
    });
  });
}, [mounted, carregado]);

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

const semPesquisa =
  busca.trim().length < 2 &&
  buscaIngredientes.trim() === "" &&
  !filtroCategoria;

const receitasOficiais = receitas.filter((receita) => {
  if (receita.tipo !== "oficial") return false;

  if (semPesquisa) {
    return receita.colecaoInicial === true;
  }

  return true;
});

useEffect(() => {
  if (!carregado) return;
  if (!("serviceWorker" in navigator)) return;
  if (!navigator.onLine) return;

  const urlsReceitas = receitas
    .filter(
      (receita) =>
        receita.tipo === "oficial" &&
        receita.colecaoInicial === true
    )
    .map((receita) => `/receita/${receita.id}`);

  if (urlsReceitas.length === 0) return;

  navigator.serviceWorker.ready.then((registration) => {
    // Guarda também a página HTML de cada receita.
    registration.active?.postMessage({
      type: "CACHE_RECEITAS",
      urls: urlsReceitas,
    });

    // Faz o próprio Next.js pré-carregar os dados internos
    // usados pelo App Router.
    urlsReceitas.forEach((url) => {
      router.prefetch(url);
    });

    // Pré-carrega também a página fixa usada
// pelas Listas de Compras no modo offline.
router.prefetch("/listas-compras/offline");
router.prefetch("/receita/offline");

// Pré-carrega também as páginas principais.
// Assim a Navbar pode navegar offline sem recarregar a aplicação.
router.prefetch("/recepcao");
router.prefetch("/");
router.prefetch("/favoritos");

  });
}, [carregado, receitas, router]);

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

const receitasOrdenadas = [...receitasFiltradas].sort((a, b) => {
  const aColecaoInicial = a.colecaoInicial === true;
  const bColecaoInicial = b.colecaoInicial === true;

  // Prioriza sempre as receitas da Coleção Inicial
  if (aColecaoInicial && !bColecaoInicial) return -1;
  if (!aColecaoInicial && bColecaoInicial) return 1;

  // Dentro de cada grupo, mantém a ordenação escolhida
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

const categorias = CATEGORIAS_RECEITAS;

const ingredientesDigitados = buscaIngredientes
  .toLowerCase()
  .split(/[,\s;]+/)
  .map((item) => item.trim())
  .filter(Boolean);

const receitasPorIngredientes =
  ingredientesBusca.length === 0
    ? []
    : receitas
        .filter((receita) => receita.tipo === "oficial")
        .map((receita) => {
          const palavrasIngredientes = normalizarBusca(
            receita.ingredientes.join(" ")
          ).split(" ");

          const encontrados = ingredientesBusca.filter((ingrediente) =>
            palavrasIngredientes.some((palavra) =>
              palavra.startsWith(ingrediente)
            )
          );

          return {
            receita,
            pontos: encontrados.length,
            encontrados,
          };
        })
        .filter((item) => item.pontos > 0)
        .sort((a, b) => {
          const aColecaoInicial =
            a.receita.colecaoInicial === true;
          const bColecaoInicial =
            b.receita.colecaoInicial === true;

          // Prioriza a Coleção Inicial
          if (aColecaoInicial && !bColecaoInicial) return -1;
          if (!aColecaoInicial && bColecaoInicial) return 1;

          // Depois considera a quantidade de ingredientes encontrados
          return b.pontos - a.pontos;
        })
        .slice(0, LIMITE_RECEITAS_SIMILARES);
          
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

};

const handleFavorito = (receita: Receita) => {
  toggleFavorito(receita.id);
};

function handleVer(receita: Receita) {
  sessionStorage.setItem(
    "estadoHomePesquisa",
    JSON.stringify({
      busca,
      buscaIngredientes,
      filtroCategoria,
      ordenacao,
      scrollY: window.scrollY,
    })
  );

  sessionStorage.setItem(
    "origemVer",
    JSON.stringify({
      origem: "home-pesquisa",
      receitaId: String(receita.id),
    })
  );
}

// ===== INÍCIO DA ALTERAÇÃO =====
function iniciarEdicao(r: Receita) {
  router.push(`/administracao?id=${r.id}`);
}

// ===== FIM DA ALTERAÇÃO =====
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

<PainelIngredientes
  buscaIngredientes={buscaIngredientes}
  setBuscaIngredientes={setBuscaIngredientes}
  receitasPorIngredientes={receitasPorIngredientes}
/>

<PainelOrdenacao
  ordenacao={ordenacao}
  setOrdenacao={setOrdenacao}
/>
    <ListaReceitas
  receitasFiltradas={receitasOrdenadas}
  totalReceitas={receitasOficiais.length}
  categorias={categorias}
  handleVer={handleVer}
  handleFavorito={handleFavorito}
  handleRemover={handleRemover}
  iniciarEdicao={iniciarEdicao}
  editandoId={null}
/>
  
</div>
);
}