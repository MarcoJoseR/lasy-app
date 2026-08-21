"use client";

// ===== INÍCIO DA ALTERAÇÃO =====
import { useState } from "react";
import { useListasCompras } from "@/app/context/ListasComprasContext";
// ===== FIM DA ALTERAÇÃO =====

interface ModalMinhasListasProps {
  aberto: boolean;
  onFechar: () => void;
  onAbrirLista: (listaId: string) => void;
}

export default function ModalMinhasListas({
  aberto,
  onFechar,
  onAbrirLista,
}: ModalMinhasListasProps) {
  
// ===== INÍCIO DA ALTERAÇÃO =====
  const { listas, removerListas } = useListasCompras();
// ===== FIM DA ALTERAÇÃO =====
  
// ===== INÍCIO DA ALTERAÇÃO =====
  const [listaSelecionadaId, setListaSelecionadaId] =
    useState<string | null>(null);

// ===== INÍCIO DA ALTERAÇÃO =====
  const [listaExclusaoId, setListaExclusaoId] =
    useState<string | null>(null);

  const listasOrdenadas = [...listas].sort((a, b) => {
    return (
      new Date(b.atualizadaEm).getTime() -
      new Date(a.atualizadaEm).getTime()
    );
  });
// ===== FIM DA ALTERAÇÃO =====

  function handleAbrirLista() {
    if (!listaSelecionadaId) {
      return;
    }

    onAbrirLista(listaSelecionadaId);
    setListaSelecionadaId(null);
  }
  // ===== FIM DA ALTERAÇÃO =====

// ===== INÍCIO DA ALTERAÇÃO =====
function handleExcluirLista() {
  if (!listaExclusaoId) {
    return;
  }

  const listaParaExcluir = listas.find(
    (lista) => lista.id === listaExclusaoId
  );

  if (!listaParaExcluir) {
    return;
  }

  const confirmou = window.confirm(
    `Excluir Lista (${listaParaExcluir.nomeReceita})?`
  );

  if (!confirmou) {
    return;
  }

  removerListas([listaExclusaoId]);

  setListaExclusaoId(null);

  if (listaSelecionadaId === listaExclusaoId) {
    setListaSelecionadaId(null);
  }
}
// ===== FIM DA ALTERAÇÃO =====

// ===== INÍCIO DA ALTERAÇÃO =====
  function handleFecharModal() {
    setListaSelecionadaId(null);
    setListaExclusaoId(null);
    onFechar();
  }
// ===== FIM DA ALTERAÇÃO =====

  if (!aberto) {
    return null;
  }

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-minhas-listas"
        onClick={handleFecharModal}
       >
      <div
        className="w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-zinc-700 px-5 py-4">
          <div>
            <h2
              id="titulo-modal-minhas-listas"
              className="text-xl font-bold text-white"
            >
              🛒 Minhas Listas de Compras
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Abra uma lista salva para continuar suas anotações.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFecharModal}
            className="rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Fechar Minhas Listas de Compras"
          >
            ✕
          </button>
        </header>

        <main className="max-h-[65vh] overflow-y-auto p-5">
          {listas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center">
              <p className="font-semibold text-white">
                Nenhuma Lista de Compras salva
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                As listas criadas a partir das receitas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div>
              {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
              <div className="mb-2 flex items-center gap-4 px-4">
                <span className="w-5 text-center text-xs font-semibold text-white">
                  VER
                </span>

                <div className="flex-1" />

                <span className="w-5 text-center text-xs font-semibold text-white">
                  EXCLUIR
                </span>
              </div>
              {/* ===== FIM DA ALTERAÇÃO ===== */}

              <div className="space-y-3">
                {listasOrdenadas.map((lista) => (
                  <div
                    key={lista.id}
                    className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-950 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={listaSelecionadaId === lista.id}
                      onChange={(event) => {
                        const novoId = event.target.checked ? lista.id : null;

                        setListaSelecionadaId(novoId);

                        if (novoId) {
                          setListaExclusaoId(null);
                        }
                      }}
                      className="h-5 w-5 shrink-0 cursor-pointer"
                      aria-label={`Selecionar lista ${lista.nomeReceita}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">
                        {lista.nomeReceita}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        {lista.itens.length}{" "}
                        {lista.itens.length === 1 ? "item" : "itens"}
                      </p>
                    </div>

                    {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
            <button
              type="button"
              onClick={() => {
                const novoId =
                  listaExclusaoId === lista.id ? null : lista.id;

                setListaExclusaoId(novoId);

                if (novoId) {
                  setListaSelecionadaId(null);
                }
              }}
              className={`
                flex h-5 w-5 shrink-0
                items-center justify-center
                rounded
                border
                text-sm font-bold
                transition
                ${
                  listaExclusaoId === lista.id
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-zinc-400 bg-white text-transparent hover:border-red-500"
                }
              `}
              aria-label={`Marcar ${lista.nomeReceita} para exclusão`}
              title="Marcar para excluir"
            >
              ×
            </button>
            {/* ===== FIM DA ALTERAÇÃO ===== */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

       {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
        <footer className="flex justify-end gap-3 border-t border-zinc-700 px-5 py-4">
          <button
            type="button"
            onClick={handleAbrirLista}
            disabled={!listaSelecionadaId}
            className={`
              rounded-lg px-4 py-2 font-semibold text-white transition
              ${
                listaSelecionadaId
                  ? "bg-green-600 hover:bg-green-700"
                  : "cursor-not-allowed bg-zinc-700 text-zinc-400"
              }
            `}
          >
            Abrir
          </button>

          {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
          <button
            type="button"
            onClick={handleExcluirLista}
            disabled={!listaExclusaoId}
            className={`
              rounded-lg px-4 py-2 font-semibold transition
              ${
                listaExclusaoId
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "cursor-not-allowed bg-zinc-700 text-zinc-400"
              }
            `}
          >
            Excluir
          </button>
          {/* ===== FIM DA ALTERAÇÃO ===== */}

          <button
            type="button"
            onClick={handleFecharModal}
            className="rounded-lg bg-zinc-700 px-4 py-2 font-semibold text-white transition hover:bg-zinc-600"
          >
            Fechar
          </button>
        </footer>
        {/* ===== FIM DA ALTERAÇÃO ===== */}
      </div>
    </div>
  );
}