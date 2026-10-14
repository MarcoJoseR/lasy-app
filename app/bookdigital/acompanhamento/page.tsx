
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ItemBiblioteca } from "@/types/bookdigital";

import {
  listarItens,
  toggleAcompanhamentoItem,
} from "@/app/lib/bookdigital-itens";

import {
  listarTemas,
} from "@/app/lib/bookdigital-temas";

export default function PaginaAcompanhamento() {
  const router = useRouter();

  const [itens, setItens] = useState<ItemBiblioteca[]>([]);
  const [nomesTemas, setNomesTemas] =
    useState<Record<string, string>>({});

  useEffect(() => {
    setItens(
      listarItens().filter(
        (item) => item.emAcompanhamento
      )
    );

    const temas = listarTemas();

    setNomesTemas(
      Object.fromEntries(
        temas.map((tema) => [tema.id, tema.nome])
      )
    );
  }, []);

  function retirarAcompanhamento(itemId: string) {
    try {
      toggleAcompanhamentoItem(itemId);

      setItens((anteriores) =>
        anteriores.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error(
        "Erro ao alterar acompanhamento:",
        error
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            Lista de Acompanhamento
          </h1>

          <button
            type="button"
            onClick={() => router.push("/bookdigital")}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm"
          >
            ← Voltar
          </button>
        </div>

        {itens.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-400">
            Nenhum item em acompanhamento.
          </p>
        ) : (
          <div className="mt-8 space-y-3">
            {itens.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-700 bg-zinc-900 p-4"
              >
                <h2 className="font-semibold">
                  {item.titulo}
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Tema: {nomesTemas[item.temaId] || "Não identificado"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                        sessionStorage.setItem(
                            "bookdigitalOrigemAcompanhamento",
                            item.id
                        );

                        window.location.assign(
                            `/bookdigital/item/offline?id=${encodeURIComponent(item.id)}`
                        );
                        }}
                    className="rounded-lg border border-purple-700 px-3 py-2 text-sm font-semibold"
                  >
                    VER
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      retirarAcompanhamento(item.id)
                    }
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium"
                  >
                    ✓ Acompanhando
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
