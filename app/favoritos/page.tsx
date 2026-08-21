"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReceitas } from "../context/ReceitasContext";
import EstadoVazio from "../components/EstadoVazio";
import BotaoVoltar from "../components/BotaoVoltar";
import ModalMinhasListas from "../components/listas-compras/ModalMinhasListas";

export default function FavoritosPage() {
  const { receitas, toggleFavorito, removerReceita } = useReceitas();
  const router = useRouter();

  const [buscaNome, setBuscaNome] = useState("");
  const [buscaIngredientes, setBuscaIngredientes] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [mostrarFavoritas, setMostrarFavoritas] = useState(false);
  const recentesRef = useRef<HTMLDivElement | null>(null);
  const maisPreparadasRef = useRef<HTMLDivElement | null>(null);
  const [mostrarRecentes, setMostrarRecentes] = useState(false);
  const [mostrarMaisPreparadas, setMostrarMaisPreparadas] = useState(false);

  const [modalMinhasListasAberto, setModalMinhasListasAberto] =
  useState(false);

  const [mensagemRealizadaId, setMensagemRealizadaId] = useState<string | null>(
    null
  );

function mostrarMensagemRealizada(id: string) {
  setMensagemRealizadaId(id);

  setTimeout(() => {
    setMensagemRealizadaId((idAtual) =>
      idAtual === id ? null : idAtual
    );
  }, 2000);
}

useEffect(() => {
  const deveRestaurar =
    sessionStorage.getItem("restaurarMinhaBiblioteca") === "1";

  if (!deveRestaurar) return;

  const estadoSalvo =
    sessionStorage.getItem("estadoMinhaBiblioteca");

  if (estadoSalvo) {
    try {
      const estado = JSON.parse(estadoSalvo);

      setBuscaNome(estado.buscaNome || "");
      setBuscaIngredientes(estado.buscaIngredientes || "");
      setFiltroCategoria(estado.filtroCategoria || "");
      setOrdenacao(estado.ordenacao || "recentes");
      setMostrarFavoritas(estado.mostrarFavoritas === true);

      if (typeof estado.scrollY === "number") {
        sessionStorage.setItem(
          "scrollMinhaBiblioteca",
          String(estado.scrollY)
        );
      }
    } catch {
      // Se o estado salvo estiver inválido,
      // abre a Minha Biblioteca normalmente.
    }
  }
  sessionStorage.removeItem("restaurarMinhaBiblioteca");
}, []);

useEffect(() => {
  const scrollSalvo =
    sessionStorage.getItem("scrollMinhaBiblioteca");

  if (!scrollSalvo) return;

  const posicao = Number(scrollSalvo);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, posicao);
      sessionStorage.removeItem("scrollMinhaBiblioteca");
    });
  });
}, [receitas]);

  const minhaBiblioteca = receitas.filter(
    (r) => r.tipo === "pessoal"
  );
  
  const colecaoInicial = receitas.filter(
    (r) =>
      r.tipo === "oficial" &&
      r.colecaoInicial === true
  );

  const normalizarBusca = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[,\.;:]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const palavrasIgnoradas = [
    "de",
    "da",
    "do",
    "das",
    "dos",
    "com",
    "e",
    "a",
    "o",
  ];

  const termosNome = normalizarBusca(buscaNome)
    .split(" ")
    .filter((termo) => termo.length >= 2 && !palavrasIgnoradas.includes(termo));

  const termosIngredientes = normalizarBusca(buscaIngredientes)
    .split(" ")
    .filter((termo) => termo.length >= 2 && !palavrasIgnoradas.includes(termo));

  const pesquisaAtiva =
    termosNome.length > 0 ||
    termosIngredientes.length > 0 ||
    Boolean(filtroCategoria);

  const receitasParaPesquisa = pesquisaAtiva
    ? [...minhaBiblioteca, ...colecaoInicial]
    : minhaBiblioteca;

  const categoriasDisponiveis = Array.from(
    new Set(minhaBiblioteca.map((r) => r.categoria).filter(Boolean))
  ).sort();

  const receitasFiltradas = receitasParaPesquisa.filter((receita) => {
    const nomeNormalizado = normalizarBusca(receita.nome);
    const ingredientesNormalizados = normalizarBusca(receita.ingredientes.join(" "));

    const correspondeTipo = receita.tipo === "pessoal";

    const correspondeNome =
      termosNome.length === 0 ||
      termosNome.every((termo) => nomeNormalizado.includes(termo));

    const correspondeIngredientes =
      termosIngredientes.length === 0 ||
      termosIngredientes.every((termo) =>
        ingredientesNormalizados.includes(termo)
      );

    const correspondeCategoria =
      !filtroCategoria || receita.categoria === filtroCategoria;

    const correspondeFavorita =
      !mostrarFavoritas || receita.favorito;

    return (
      correspondeNome &&
      correspondeIngredientes &&
      correspondeCategoria &&
      correspondeFavorita
    );
});

 const receitasOrdenadas = [...receitasFiltradas].sort((a, b) => {
  if (ordenacao === "nome-az") {
    return a.nome.localeCompare(b.nome);
  }

  if (ordenacao === "nome-za") {
    return b.nome.localeCompare(a.nome);
  }

  if (ordenacao === "atualizadas") {
    return (
      new Date(b.atualizadoEm || b.criadoEm || 0).getTime() -
      new Date(a.atualizadoEm || a.criadoEm || 0).getTime()
    );
  }

  return (
    new Date(b.criadoEm || 0).getTime() -
    new Date(a.criadoEm || 0).getTime()
  );
});

const receitasRecentes = receitas
  .filter(
    (receita) =>
      receita.tipo === "pessoal" &&
      (receita.preparacoes?.length ?? 0) > 0
  )
  .map((receita) => ({
    receita,
    ultimaPreparacao:
      receita.preparacoes?.[receita.preparacoes.length - 1] || "",
  }))
  .sort(
    (a, b) =>
      new Date(b.ultimaPreparacao).getTime() -
      new Date(a.ultimaPreparacao).getTime()
  )
  .slice(0, 5);

const receitasMaisPreparadas = receitas
  .filter(
    (receita) =>
      receita.tipo === "pessoal" &&
      (receita.preparacoes?.length ?? 0) > 0
  )
  .sort(
    (a, b) =>
      (b.preparacoes?.length ?? 0) -
      (a.preparacoes?.length ?? 0)
  )
  .slice(0, 8);

function handleVerReceita(receitaId: string) {
  sessionStorage.setItem(
    "estadoMinhaBiblioteca",
    JSON.stringify({
      buscaNome,
      buscaIngredientes,
      filtroCategoria,
      ordenacao,
      mostrarFavoritas,
      scrollY: window.scrollY,
    })
  );

  sessionStorage.setItem(
    "origemVer",
    JSON.stringify({
      origem: "minha-biblioteca",
      receitaId: String(receitaId),
    })
  );

  if (!navigator.onLine) {
  window.location.href =
    `/receita/offline?id=${receitaId}`;
  return;
}

router.push(`/receita/${receitaId}`);
}

  return (
    <main className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-lg shadow-sm mb-4">
        <span className="text-yellow-400 text-xl">📚</span>
        <h1 className="text-2xl font-bold text-white">Minha Biblioteca</h1>
      </div>

      <BotaoVoltar />

<div className="mt-3 mb-4 flex flex-wrap gap-2">
  {receitasRecentes.length > 0 && (
    <div ref={recentesRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setMostrarRecentes((atual) => !atual);
          setMostrarMaisPreparadas(false);
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
      >
        🍳 Receitas recentes
      </button>

      {mostrarRecentes && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
          <div className="space-y-1">
            {receitasRecentes.map(({ receita }) => (
              <button
                key={receita.id}
                type="button"
                onClick={() => {
                  setMostrarRecentes(false);

                  if (!navigator.onLine) {
                    window.location.href =
                      `/receita/offline?id=${receita.id}`;
                    return;
                  }

                  router.push(`/receita/${receita.id}`);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 transition"
              >
                {receita.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
 
{receitasMaisPreparadas.length > 0 && (
  <div ref={maisPreparadasRef} className="relative">
    <button
      type="button"
      onClick={() => {
        setMostrarMaisPreparadas((atual) => !atual);
        setMostrarRecentes(false);
      }}
      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
    >
      🔥 Mais preparadas
    </button>

    {mostrarMaisPreparadas && (
      <div className="absolute left-0 top-full z-30 mt-2 min-w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
        <div className="space-y-1">
          {receitasMaisPreparadas.map((receita) => (
            <button
              key={receita.id}
              type="button"
              onClick={() => {
                setMostrarMaisPreparadas(false);

                if (!navigator.onLine) {
                  window.location.href =
                    `/receita/offline?id=${receita.id}`;
                  return;
                }

                router.push(`/receita/${receita.id}`);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-zinc-800 transition"
            >
              {receita.nome}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
)}
</div>

      {minhaBiblioteca.length === 0 ? (
        <EstadoVazio
          titulo="Sua biblioteca ainda está vazia"
          mensagem="Adicione receitas à sua biblioteca para encontrá-las rapidamente aqui."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-yellow-400">
              {receitasOrdenadas.length} receitas disponíveis
            </p>
            
            <Link
              href="/minha-receita"
              className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 transition"
            >
              🍳 Criar Receita
            </Link>
          
            <button
              type="button"
              onClick={() => setModalMinhasListasAberto(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
            >
              🛒 Listas de Compras
            </button>

            <button
              type="button"
              onClick={() => setMostrarFavoritas((valorAtual) => !valorAtual)}
              className="rounded-lg border border-yellow-400 px-4 py-2 text-base font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
              >
              {mostrarFavoritas
                ? "📚 Ver Biblioteca Completa"
                : "⭐ Ver Favoritas"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="🔎 Buscar receita na Minha Biblioteca..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
            />

            <input
              type="text"
              placeholder="🥕 Buscar por ingredientes..."
              value={buscaIngredientes}
              onChange={(e) => setBuscaIngredientes(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-white">
                📂 Buscar por categoria
              </label>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
              >
                <option value="">Todas as categorias</option>
                {categoriasDisponiveis.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-white">
                Ordenar por
              </label>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
              >
                <option value="recentes">📅 Mais recentes</option>
                <option value="atualizadas">✏️ Atualizadas recentemente</option>
                <option value="nome-az">Nome (A-Z)</option>
                <option value="nome-za">Nome (Z-A)</option>
              </select>
            </div>
          </div>

          {filtroCategoria && (
            <button
              onClick={() => setFiltroCategoria("")}
              className="mb-6 bg-yellow-500 text-black px-3 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              🔄 Todas as categorias
            </button>
          )}

          {receitasOrdenadas.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma receita encontrada"
              mensagem="Tente buscar por outro nome, ingrediente ou categoria."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {receitasOrdenadas.map((receita) => (
                <div
                  key={receita.id}
                  className="relative bg-zinc-900 rounded-xl overflow-hidden"
                >
                  {(receita.preparacoes?.length ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => mostrarMensagemRealizada(String(receita.id))}
                      className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow"
                      title="Receita já realizada"
                      aria-label="Receita já realizada"
                    >
                      ✓
                    </button>
                  )}

              {mensagemRealizadaId === String(receita.id) && (
                <div className="absolute right-3 top-12 z-20 rounded-lg bg-black/90 px-3 py-2 text-xs font-medium text-white shadow-lg">
                  ✓ Receita já realizada
                </div>
              )}

                  <img
                    src={receita.imagem || "/images/categorias/sem-imagem.jpg"}
                    className="w-full h-40 object-cover"
                    alt={receita.nome}
                  />

                  <div className="p-4">
                    <h2 className="font-semibold mb-1">{receita.nome}</h2>

                    <p className="text-sm text-zinc-400 mb-3">
                      {receita.categoria}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerReceita(String(receita.id))}
                        className="text-sm bg-green-600 px-3 py-1 rounded hover:scale-105 transition"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/minha-receita?id=${receita.id}`)
                        }
                        className="text-sm bg-blue-600 px-3 py-1 rounded hover:scale-105 transition"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        onClick={() => {
                          const confirmou = window.confirm(
                            `Deseja realmente excluir a receita "${receita.nome}"?`
                          );

                          if (confirmou) {
                            removerReceita(receita.id);
                          }
                        }}
                        className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700 hover:scale-105 transition"
                        title="Excluir receita"
                      >
                        🗑️ Excluir
                      </button>

                      <button
                        onClick={() => toggleFavorito(receita.id)}
                        className={`text-sm px-3 py-1 rounded font-semibold transition hover:scale-105 ${
                          receita.favorito
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                        }`}
                        title={
                          receita.favorito
                            ? "Remover dos favoritos"
                            : "Adicionar aos favoritos"
                        }
                      >
                        {receita.favorito ? "✓ Favorita" : "☆Favoritar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ModalMinhasListas
        aberto={modalMinhasListasAberto}
        onFechar={() => setModalMinhasListasAberto(false)}
        onAbrirLista={(listaId) => {
          setModalMinhasListasAberto(false);

          if (!navigator.onLine) {
            window.location.href =
              `/listas-compras/offline?id=${listaId}`;
            return;
          }

          router.push(`/listas-compras/${listaId}`);
        }}
      />
    </main>
  );
}