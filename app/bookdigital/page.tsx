"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Tema } from "@/types/bookdigital";

import {
  criarTema,
  listarTemas,
  renomearTema,
  removerTema,
} from "@/app/lib/bookdigital-temas";

export default function BookDigitalPage() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [novoTema, setNovoTema] = useState("");
  const [erro, setErro] = useState("");
  
  const [temaEditandoId, setTemaEditandoId] = useState<string | null>(null);
  const [nomeTemaEditando, setNomeTemaEditando] = useState("");

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

function iniciarEdicaoTema(temaId: string, nomeAtual: string) {
  setTemaEditandoId(temaId);
  setNomeTemaEditando(nomeAtual);
  setErro("");
}

function cancelarEdicaoTema() {
  setTemaEditandoId(null);
  setNomeTemaEditando("");
  setErro("");
}

function salvarEdicaoTema() {
  const nomeLimpo = nomeTemaEditando.trim();

  if (!temaEditandoId) {
    return;
  }

  if (!nomeLimpo) {
    setErro("Digite um nome para o tema.");
    return;
  }

  const nomeJaExiste = temas.some(
    (tema) =>
      tema.id !== temaEditandoId &&
      tema.nome.toLowerCase() === nomeLimpo.toLowerCase()
  );

  if (nomeJaExiste) {
    setErro("Já existe um tema com esse nome.");
    return;
  }

  try {
    renomearTema(temaEditandoId, nomeLimpo);

    setTemas(listarTemas());

    setTemaEditandoId(null);
    setNomeTemaEditando("");
    setErro("");
  } catch (error) {
    if (error instanceof Error) {
      setErro(error.message);
    }
  }
}

function excluirTema(
  temaId: string,
  nomeTema: string
) {
  const confirmar = window.confirm(
    `Deseja realmente excluir o tema "${nomeTema}"?`
  );

  if (!confirmar) {
    return;
  }

  try {
    removerTema(temaId);

    setTemas(listarTemas());
  } catch (error) {
    if (error instanceof Error) {
      window.alert(error.message);
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
            <div
              key={tema.id}
              className="rounded-xl border-4 border-purple-700 bg-zinc-900 p-2 shadow"
            >
              {temaEditandoId === tema.id ? (
                <div>
                  <input
                    type="text"
                    value={nomeTemaEditando}
                    onChange={(e) =>
                      setNomeTemaEditando(e.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-white p-2 text-sm text-black"
                  />

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={salvarEdicaoTema}
                      className="flex-1 rounded-lg bg-purple-700 px-2 py-2 text-xs font-semibold text-white"
                    >
                      Salvar
                    </button>

                    <button
                      type="button"
                      onClick={cancelarEdicaoTema}
                      className="flex-1 rounded-lg border border-zinc-700 px-2 py-2 text-xs font-semibold text-zinc-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/bookdigital/tema/${tema.id}`)
                    }
                    className="min-h-12 w-full px-1 py-2 text-base font-bold text-white"
                  >
                    {tema.nome}
                  </button>

                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        iniciarEdicaoTema(tema.id, tema.nome)
                      }
                      className="flex-1 rounded-lg border border-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        excluirTema(tema.id, tema.nome)
                      }
                      className="flex-1 rounded-lg border border-red-900 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-950"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
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