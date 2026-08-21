"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useReceitas } from "../../context/ReceitasContext";
import {
  formatarIngredientes,
  formatarModoPreparo,
} from "@/app/utils/renderReceita";

import ModoPreparacao from "@/app/components/modo-preparacao/ModoPreparacao";
import { useListasCompras } from "../../context/ListasComprasContext";

export default function ReceitaDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const idReceita =
    searchParams.get("id") || String(id);
    
  const {
  receitas,
  toggleFavorito,
  adicionarNaBiblioteca,
  carregado,
} = useReceitas();

  const { obterOuCriarLista } = useListasCompras();

  const receita = receitas.find(
  (r) => String(r.id) === String(idReceita)
);

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [modoPreparacao, setModoPreparacao] = useState(false);
  const [mostrarMensagemRealizada, setMostrarMensagemRealizada] =
    useState(false);

useEffect(() => {
  if (!receita) return;

  const receitaAdicionadaId =
    sessionStorage.getItem("receitaAdicionada");

  if (receitaAdicionadaId !== String(receita.id)) {
    return;
  }

  sessionStorage.removeItem("receitaAdicionada");

  setMensagemSucesso(
    "✅ Receita adicionada à Minha Biblioteca."
  );

  const temporizador = setTimeout(() => {
    setMensagemSucesso("");
  }, 2500);

  return () => {
    clearTimeout(temporizador);
  };
}, [receita?.id]);

useEffect(() => {
  if (!receita) return;

  const iniciarPreparacaoId =
    sessionStorage.getItem("iniciarPreparacao");

  if (iniciarPreparacaoId !== String(receita.id)) {
    return;
  }

  sessionStorage.removeItem("iniciarPreparacao");

  setModoPreparacao(true);
}, [receita?.id]);

if (!carregado) {
    return <p className="p-6 text-white">Carregando receita...</p>;
  }

  if (!receita) {
    return <p className="p-6 text-white">Receita não encontrada</p>;
  }

  if (modoPreparacao) {
    return (
      <ModoPreparacao
        receita={{
          id: String(receita.id),
          nome: receita.nome,
          ingredientes: formatarIngredientes(receita.ingredientes),
          modoPreparo: formatarModoPreparo(receita.modoPreparo).itens,
        }}
        onSair={() => setModoPreparacao(false)}
      />
    );
  }

  const ingredientesFormatados = formatarIngredientes(receita.ingredientes);
  const preparoFormatado = formatarModoPreparo(receita.modoPreparo);

  function handleAdicionarNaBiblioteca() {
  if (!receita) return;

  const nomeJaExisteNaBiblioteca = receitas.some(
    (r) =>
      r.tipo === "pessoal" &&
      r.nome.trim().toLowerCase() ===
        receita.nome.trim().toLowerCase()
  );

  if (nomeJaExisteNaBiblioteca) {
    setMensagemSucesso(
      "⚠️ Já existe uma receita com esse nome na sua Biblioteca."
    );
    return;
  }

  const novaReceita = adicionarNaBiblioteca(receita);

  sessionStorage.setItem(
    "receitaAdicionada",
    novaReceita.id
  );

  router.replace(`/receita/${novaReceita.id}`);
}

function handleIniciarPreparacao() {
  if (!receita) return;

  // Receita pessoal: pode iniciar diretamente.
  if (receita.tipo === "pessoal") {
    const agora = new Date();
    const preparacaoSalva = localStorage.getItem("preparacaoPendente");

    let criarNovaPreparacao = true;

    if (preparacaoSalva) {
      try {
        const preparacaoAtual = JSON.parse(preparacaoSalva);

        const mesmaReceita =
          String(preparacaoAtual.receitaId) === String(receita.id);

        if (mesmaReceita && preparacaoAtual.iniciadaEm) {
          const iniciadaEm = new Date(preparacaoAtual.iniciadaEm);

          const mesmoDia =
            iniciadaEm.getFullYear() === agora.getFullYear() &&
            iniciadaEm.getMonth() === agora.getMonth() &&
            iniciadaEm.getDate() === agora.getDate();

          if (mesmoDia) {
            criarNovaPreparacao = false;
          }
        }
      } catch {
        criarNovaPreparacao = true;
      }
    }

    if (criarNovaPreparacao) {
      localStorage.setItem(
        "preparacaoPendente",
        JSON.stringify({
          receitaId: String(receita.id),
          iniciadaEm: agora.toISOString(),
        })
      );
    }

    setModoPreparacao(true);
    return;
  }

  // Receita oficial: procura uma cópia já existente
  // na Minha Biblioteca.
  const receitaExistente = receitas.find(
    (r) =>
      r.tipo === "pessoal" &&
      r.nome.trim().toLowerCase() ===
        receita.nome.trim().toLowerCase()
  );

  if (receitaExistente) {
    localStorage.setItem(
      "preparacaoPendente",
      JSON.stringify({
        receitaId: String(receitaExistente.id),
        iniciadaEm: new Date().toISOString(),
      })
    );

    sessionStorage.setItem(
      "iniciarPreparacao",
      String(receitaExistente.id)
    );

    if (!navigator.onLine) {
  window.location.href =
    `/receita/offline?id=${receitaExistente.id}`;
  return;
}

router.replace(`/receita/${receitaExistente.id}`);
    return;
  }

  // Se ainda não existe, cria a cópia pessoal.
  const novaReceita = adicionarNaBiblioteca(receita);

  localStorage.setItem(
    "preparacaoPendente",
    JSON.stringify({
      receitaId: String(novaReceita.id),
      iniciadaEm: new Date().toISOString(),
    })
  );

  sessionStorage.setItem(
    "iniciarPreparacao",
    String(novaReceita.id)
  );

  if (!navigator.onLine) {
  window.location.href =
    `/receita/offline?id=${novaReceita.id}`;
  return;
}

router.replace(`/receita/${novaReceita.id}`);
}

function handleGerarListaCompras() {
  if (!receita) return;

  const lista = obterOuCriarLista(
    receita.id,
    receita.nome,
    receita.ingredientes
  );

  if (!navigator.onLine) {
  window.location.href =
    `/listas-compras/offline?id=${lista.id}`;
  return;
}

  router.push(`/listas-compras/${lista.id}`);
}

function exibirMensagemRealizada() {
  setMostrarMensagemRealizada(true);

  setTimeout(() => {
    setMostrarMensagemRealizada(false);
  }, 2000);
}

function handleVoltar() {
  if (!receita) {
    router.back();
    return;
  }

  const origemSalva = sessionStorage.getItem("origemVer");
  
  if (origemSalva) {
    try {
      const origem = JSON.parse(origemSalva);

      if (origem.receitaId === String(receita.id)) {
        if (origem.origem === "home-pesquisa") {
          sessionStorage.setItem("restaurarHomePesquisa", "1");
          sessionStorage.removeItem("origemVer");

          router.push("/");
          return;
        }

        if (origem.origem === "minha-biblioteca") {
          sessionStorage.setItem("restaurarMinhaBiblioteca", "1");
          sessionStorage.removeItem("origemVer");

          router.push("/favoritos");
          return;
        }
      }
    } catch {
      sessionStorage.removeItem("origemVer");
    }
  }

  router.back();
}

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative h-72 w-full">
        <img
          src={receita.imagem || "/images/categorias/sem-imagem.jpg"}
          alt={receita.nome}
          onError={(e) => {
            e.currentTarget.src = "/images/categorias/sem-imagem.jpg";
          }}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <button
          onClick={handleVoltar}
          className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded hover:scale-105 transition"
        >
          ← Voltar
        </button>

        {(receita.preparacoes?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={exibirMensagemRealizada}
            className="absolute right-4 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow"
            title="Receita já realizada"
            aria-label="Receita já realizada"
          >
            ✓
          </button>
        )}

        {mostrarMensagemRealizada && (
          <div className="absolute right-16 top-16 z-20 rounded-lg bg-black/90 px-3 py-2 text-xs font-medium text-white shadow-lg">
            ✓ Receita já realizada
          </div>
        )}

        <button
          onClick={() => toggleFavorito(receita.id)}
          className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded hover:scale-105 transition"
        >
          {receita.favorito ? "⭐" : "☆"}
        </button>

        <h1 className="absolute bottom-4 left-4 right-4 text-2xl font-bold">
          {receita.nome}
        </h1>
      </div>

      <div className="p-6 space-y-6">
      
      {mensagemSucesso && (
        <div className="bg-green-700 text-white px-4 py-3 rounded-lg font-medium">
          {mensagemSucesso}
        </div>
      )}
        
          <button
            type="button"
            onClick={handleIniciarPreparacao}
            className="bg-orange-500 text-black px-5 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition"
          >
            🍳 Iniciar Preparação
          </button>

          <button
            type="button"
            onClick={handleGerarListaCompras}
            className="bg-blue-800 text-white px-5 py-3 rounded-lg text-lg font-semibold hover:bg-blue-900 transition"
          >
            🛒 Gerar Lista de Compras
          </button>

        {receita.tipo === "oficial" && (
          <button
            type="button"
            onClick={handleAdicionarNaBiblioteca}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            📚 Adicionar à Minha Biblioteca
          </button>
        )}
        
        {receita.tipo === "pessoal" && (
          <button
            onClick={() =>
              router.push(`/minha-receita?id=${receita.id}`)
            }
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            ✏️ Editar Receita
          </button>
        )}

           {/* CATEGORIA */}
            {receita.categoria && (
              <p className="text-white font-medium">
                📂 Categoria: {receita.categoria}
              </p>
            )}

            {receita.subCategoria && (
              <p className="text-white font-medium">
                🗂️ Subcategoria: {receita.subCategoria}
              </p>
            )}

            {/* ORIGEM */}
            {receita.origem && (
              <p className="text-white font-medium">
                🔗 Origem:{" "}
                <a
                  href={receita.origem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Abrir publicação original
                </a>
              </p>
            )}

        {/* TEMPO E RENDIMENTO */}
        {(receita.tempo || receita.porcoes) && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white font-medium">
            {receita.tempo && (
              <p>⏱ Tempo: {receita.tempo}</p>
            )}

            {receita.porcoes && (
              <p>🍽️ Rendimento: {receita.porcoes}</p>
            )}
          </div>
        )}

        {/* DATAS */}
        {(receita.criadoEm || receita.atualizadoEm) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
            {receita.criadoEm && (
              <p>
                Criada em:{" "}
                {new Date(receita.criadoEm).toLocaleDateString("pt-BR")}
              </p>
            )}

            {receita.atualizadoEm && (
              <p>
                Atualizada em:{" "}
                {new Date(receita.atualizadoEm).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        )}

            <div>
              <h2 className="text-lg font-semibold mb-3">
                🧾 Ingredientes
              </h2>

              <ul className="space-y-2">
                {ingredientesFormatados.map((i, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-zinc-900/70 px-3 py-2 rounded-lg"
                  >
                    <span className="text-yellow-400 mt-1">•</span>
                    <span className="text-zinc-100 leading-relaxed">{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">
                👨🍳 Modo de preparo
              </h2>

              <div className="bg-zinc-900 p-5 rounded-xl leading-relaxed">
                {preparoFormatado.tipo === "numerado" && (
                  <ol className="space-y-4 list-decimal list-inside">
                    {preparoFormatado.itens.map((passo, i) => (
                      <li
                        key={i}
                        className="text-zinc-100 marker:text-yellow-400"
                      >
                        {passo}
                      </li>
                    ))}
                  </ol>
                )}

                {preparoFormatado.tipo === "lista" && (
                  <ul className="space-y-3">
                    {preparoFormatado.itens.map((passo, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-yellow-400">•</span>
                        <span>{passo}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {preparoFormatado.tipo === "texto" && (
                  <p className="text-zinc-100">
                    {preparoFormatado.itens[0] || "Sem instruções"}
                  </p>
                )}
              </div>
            </div>
        </div>
    </main>
  );
}