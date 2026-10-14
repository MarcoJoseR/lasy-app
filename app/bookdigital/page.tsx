"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Tema } from "@/types/bookdigital";

import {
  criarTema,
  listarTemas,
  renomearTema,
  removerTema,
} from "@/app/lib/bookdigital-temas";

import type { ItemBiblioteca } from "@/types/bookdigital";

import { listarItens } from "@/app/lib/bookdigital-itens";

import { filtrarItensBookDigital } from "@/app/lib/bookdigital-filtros";

import { obterImagemCapa } from "@/app/lib/bookdigital-imagens";

export default function BookDigitalPage() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [novoTema, setNovoTema] = useState("");
  const [erro, setErro] = useState("");
  
  const [buscaGeral, setBuscaGeral] = useState("");

  const [itensBiblioteca, setItensBiblioteca] =
    useState<ItemBiblioteca[]>([]);

  const [capasBusca, setCapasBusca] =
    useState<Record<string, string>>({});

  const [temaEditandoId, setTemaEditandoId] = useState<string | null>(null);
  const [nomeTemaEditando, setNomeTemaEditando] = useState("");

  const router = useRouter();

  useEffect(() => {
    setTemas(listarTemas());
    setItensBiblioteca(listarItens());

    const buscaAnterior = sessionStorage.getItem(
      "bookdigitalBuscaRestaurar"
    );

    if (buscaAnterior !== null) {
      setBuscaGeral(buscaAnterior);

      sessionStorage.removeItem(
        "bookdigitalBuscaRestaurar"
      );
    }
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

const resultadosBuscaGeral = useMemo(() => {
  if (!buscaGeral.trim()) {
    return [];
  }

  return filtrarItensBookDigital(itensBiblioteca, {
    busca: buscaGeral,
    somenteFavoritos: false,
    somenteComVideo: false,
    somenteComDocumentos: false,
    somenteComImagens: false,
  });
}, [buscaGeral, itensBiblioteca]);
 
useEffect(() => {
  let cancelado = false;

  async function carregarCapasBusca() {
    const novasCapas: Record<string, string> = {};

    await Promise.all(
      resultadosBuscaGeral.map(async (item) => {
        if (!item.chaveImagemCapa) return;

        try {
          const imagem = await obterImagemCapa(
            item.chaveImagemCapa
          );

          if (imagem) {
            novasCapas[item.id] = imagem;
          }
        } catch (error) {
          console.error(
            "Erro ao carregar capa da busca:",
            error
          );
        }
      })
    );

    if (!cancelado) {
      setCapasBusca(novasCapas);
    }
  }

  void carregarCapasBusca();

  return () => {
    cancelado = true;
  };
}, [resultadosBuscaGeral]);

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
              className="flex h-full min-w-0 flex-col rounded-xl border-4 border-purple-700 bg-zinc-900 p-2 shadow"
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
                    onClick={() => {
                      window.location.assign(
                        `/bookdigital/tema/offline?id=${encodeURIComponent(tema.id)}`
                      );
                    }}
                    
                    className="flex min-h-12 w-full min-w-0 flex-1 items-center justify-center break-words [overflow-wrap:anywhere] px-1 py-2 text-center text-base font-bold text-white"
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

        {/* ACESSO À LISTA DE ACOMPANHAMENTO */}
        <button
          type="button"
          onClick={() =>
            router.push("/bookdigital/acompanhamento")
          }
          className="mt-6 w-full rounded-xl border border-purple-700 bg-zinc-900 px-4 py-3 text-base font-semibold text-white hover:bg-zinc-800"
        >
          ✓ Lista de Acompanhamento
        </button>

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

          {/* BUSCA GERAL DO BAÚDIGITAL */}
          <div className="mt-8 rounded-xl border border-zinc-800 bg-slate-900 p-4">

            <h2 className="text-xl font-bold text-white">
              Buscar no BaúDigital
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Encontre informações armazenadas em qualquer Tema.
            </p>

            <label className="mt-5 block text-sm font-medium text-white">
              O que você procura?
            </label>

            <input
              type="text"
              value={buscaGeral}
              onChange={(e) => setBuscaGeral(e.target.value)}
              placeholder="Ex.: excel, contrato, cliente"
              className="mt-2 w-full rounded-lg border border-zinc-600 bg-white p-3 text-black"
            />

            <button
              type="button"
              onClick={() => {
                document.getElementById("resultados-busca-geral")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
              className="mt-4 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-600"
            >
              🔍 Procurar informações
            </button>

          </div>

          {/* RESULTADOS DA BUSCA */}
          {buscaGeral.trim() && (
            <div id="resultados-busca-geral" className="mt-8">

              <h2 className="text-xl font-bold">
                Informações encontradas
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                {resultadosBuscaGeral.length} item(ns) encontrado(s).
              </p>

              <div className="mt-5 space-y-4">
                {resultadosBuscaGeral.map((item) => {
                  const temaDoItem = temas.find(
                    (tema) => tema.id === item.temaId
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-700 bg-slate-900 p-5"
                    >
                      <div className="flex items-start gap-4">

                        {capasBusca[item.id] && (
                          <img
                            src={capasBusca[item.id]}
                            alt={item.titulo}
                            className="h-24 w-24 shrink-0 rounded-lg object-cover"
                            style={{
                              objectPosition: `center ${item.posicaoImagemY ?? 50}%`,
                            }}
                          />
                        )}

                        <h3 className="min-w-0 flex-1 break-words text-lg font-semibold text-white">
                          {item.titulo}
                        </h3>

                      </div>

                      <p className="mt-2 text-sm text-purple-300">
                        Tema: {temaDoItem?.nome ?? "Não identificado"}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem(
                            "bookdigitalOrigemBuscaGeral",
                            JSON.stringify({
                              itemId: item.id,
                              busca: buscaGeral,
                            })
                          );

                          const destino = navigator.onLine
                            ? `/bookdigital/item/${item.id}`
                            : `/bookdigital/item/offline?id=${encodeURIComponent(item.id)}`;

                          window.location.assign(destino);
                        }}
                        className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-500"
                      >
                        VER Item
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </main>
  );
}