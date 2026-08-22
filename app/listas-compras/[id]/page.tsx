"use client";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { KeyboardEvent, useState } from "react";

import { useListasCompras } from "../../context/ListasComprasContext";

// ===== INÍCIO DA ALTERAÇÃO =====
import { useReceitas } from "../../context/ReceitasContext";
// ===== FIM DA ALTERAÇÃO =====

export default function ListaComprasPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const idLista =
    searchParams.get("id") || String(id);

  // ===== INÍCIO DA ALTERAÇÃO =====
  const {
    listas,
    carregado,
    toggleItem,
    atualizarItem,
    adicionarItem,
    recarregarListaDaReceita,
  } = useListasCompras();

const { receitas } = useReceitas();
// ===== FIM DA ALTERAÇÃO =====

  const [novoItem, setNovoItem] = useState("");

  const lista = listas.find(
  (item) => String(item.id) === String(idLista)
);

  function handleAdicionarItem() {
    if (!lista) {
      return;
    }

    const textoLimpo = novoItem.trim();

    if (!textoLimpo) {
      return;
    }

    adicionarItem(lista.id, textoLimpo);
    setNovoItem("");
  }

// ===== INÍCIO DA ALTERAÇÃO =====
function handleRecarregar() {
  if (!lista) {
    return;
  }

  const receitaOriginal = receitas.find(
    (receita) =>
      String(receita.id) === String(lista.receitaId)
  );

  if (!receitaOriginal) {
    window.alert("Receita original não encontrada.");
    return;
  }

console.log("Receita usada no recarregar:", receitaOriginal);

  const confirmou = window.confirm(
  `Recarregar a Lista de Compras de ${receitaOriginal.nome}?\n\n` +
  `A lista será atualizada com o nome e os ingredientes atuais da receita.\n\n` +
  `Marcações, alterações e itens acrescentados manualmente nesta lista serão substituídos.`
);

  if (!confirmou) {
    return;
  }

  recarregarListaDaReceita(
    lista.id,
    receitaOriginal.nome,
    receitaOriginal.ingredientes
  );
}
// ===== FIM DA ALTERAÇÃO =====

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdicionarItem();
    }
  }

  if (!carregado) {
    return (
      <main className="min-h-screen bg-white px-4 py-8 text-black">
        <p>Carregando lista...</p>
      </main>
    );
  }

  if (!lista) {
    return (
      <main className="min-h-screen bg-white px-4 py-8 text-black">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-lg">
            Lista de Compras não encontrada.
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white"
          >
            ← Voltar
          </button>
        </div>
      </main>
    );
  }

  const dataFormatada = new Date(
    lista.criadaEm
  ).toLocaleDateString("pt-BR");

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-800 transition"
        >
          ← Voltar
        </button>

        <header className="mb-6 border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold">
            🛒 Lista de Compras
          </h1>

          <h2 className="mt-3 text-xl font-semibold">
            {lista.nomeReceita}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {dataFormatada}
          </p>
          <p className="mt-2 text-sm font-medium text-green-700">
            ✓ As alterações estão salvas.
          </p>

          {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
          <button
            type="button"
            onClick={handleRecarregar}
            className="
              mt-4
              rounded-lg
              bg-gray-700
              px-4 py-2
              font-semibold
              text-white
              transition
              hover:bg-gray-800
            "
          >
            Recarregar
          </button>
          {/* ===== FIM DA ALTERAÇÃO ===== */}
        </header>

        <section className="space-y-1">
          {lista.itens.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 border-b border-gray-200 py-1"
            >
              <input
                type="checkbox"
                checked={item.marcado}
                onChange={() =>
                  toggleItem(lista.id, item.id)
                }
                className="mt-2 h-6 w-6 shrink-0 cursor-pointer"
              />

              <input
                type="text"
                value={item.texto}
                onChange={(event) =>
                  atualizarItem(
                    lista.id,
                    item.id,
                    event.target.value
                  )
                }
                className={`
                  min-w-0 flex-1
                  rounded-md
                  border border-transparent
                  bg-white
                  px-2 py-1
                  text-lg
                  leading-7
                  text-black
                  outline-none
                  focus:border-gray-400
                  ${
                    item.marcado
                      ? "text-gray-500 line-through"
                      : ""
                  }
                `}
              />
            </div>
          ))}
        </section>

        <section className="mt-7 border-t border-gray-300 pt-5">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Acrescentar outro item
          </p>

          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={novoItem}
              onChange={(event) =>
                setNovoItem(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Digite o novo item"
              className="
                min-w-0 flex-1
                rounded-lg
                border border-gray-400
                bg-white
                px-3 py-3
                text-lg
                text-black
                outline-none
                focus:border-blue-800
                focus:ring-2
                focus:ring-blue-200
              "
            />

            <button
              type="button"
              onClick={handleAdicionarItem}
              aria-label="Adicionar item à lista"
              title="Adicionar item"
              className="
                flex
                min-h-12
                min-w-14
                items-center
                justify-center
                rounded-lg
                bg-blue-800
                px-4
                text-2xl
                font-bold
                text-white
                hover:bg-blue-900
                active:bg-blue-950
                transition
              "
            >
              ↵
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}