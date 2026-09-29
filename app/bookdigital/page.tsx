"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Tema } from "@/types/bookdigital";

import {
  criarTema,
  listarTemas,
} from "@/app/lib/bookdigital-temas";

export default function BookDigitalPage() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [novoTema, setNovoTema] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    setTemas(listarTemas());
  }, []);

  function adicionarTema() {
    try {
      setErro("");

      const temaCriado = criarTema(novoTema);

      setTemas((anteriores) => [
        ...anteriores,
        temaCriado,
      ]);

      setNovoTema("");
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      }
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
              Seu espaço pessoal
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              BaúDigital
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Organize seus conteúdos por temas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/inicio")}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            ← Início
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {temas.map((tema) => (
            <button
              key={tema.id}
              type="button"
              onClick={() =>
                router.push(`/bookdigital/tema/${tema.id}`)
              }
              className="min-h-16 rounded-xl border-4 border-purple-700 bg-zinc-900 px-3 py-3 text-base font-bold text-white shadow transition hover:bg-purple-950"
            >
              {tema.nome}
            </button>
          ))}
        </div>

        {temas.length < 9 && (
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <label className="block text-sm font-medium">
              Novo tema
            </label>

            <input
              type="text"
              value={novoTema}
              onChange={(e) =>
                setNovoTema(e.target.value)
              }
              placeholder="Ex.: Computador"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
            />

            {erro && (
              <p className="mt-2 text-sm text-red-400">
                {erro}
              </p>
            )}

            <button
              type="button"
              onClick={adicionarTema}
              className="mt-3 rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold text-white"
            >
              + Adicionar tema
            </button>
          </div>
        )}
      </div>
    </main>
  );
}