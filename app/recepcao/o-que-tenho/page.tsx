"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Receita,
  useReceitas,
} from "@/app/context/ReceitasContext";

interface ResultadoBusca {
  receita: Receita;
  ingredientesEncontrados: string[];
}

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function separarIngredientes(texto: string) {
  return texto
    .split(/[,;\n]/)
    .map((ingrediente) => normalizarTexto(ingrediente))
    .filter(Boolean);
}

export default function OQueTenhoPage() {
  const { receitas, carregado } = useReceitas();

  const [ingredientes, setIngredientes] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function procurarReceitas() {
    const ingredientesInformados = separarIngredientes(ingredientes);

    if (ingredientesInformados.length === 0) {
      setResultados([]);
      setBuscaRealizada(false);
      setMensagem("Informe pelo menos um ingrediente.");
      return;
    }

    const receitasEncontradas = receitas
      .filter((receita) => receita.tipo === "oficial")
      .map((receita) => {
        const ingredientesDaReceita = receita.ingredientes.map(normalizarTexto);

        const ingredientesEncontrados = ingredientesInformados.filter(
          (ingredienteInformado) =>
            ingredientesDaReceita.some((ingredienteDaReceita) =>
              ingredienteDaReceita.includes(ingredienteInformado)
            )
        );

        return {
          receita,
          ingredientesEncontrados,
        };
      })
      .filter(
        (resultado) => resultado.ingredientesEncontrados.length > 0
      )
      .sort(
        (resultadoA, resultadoB) =>
          resultadoB.ingredientesEncontrados.length -
          resultadoA.ingredientesEncontrados.length
      );

    setResultados(receitasEncontradas);
    setBuscaRealizada(true);
    setMensagem("");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/recepcao"
          className="text-sm text-green-400 hover:underline"
        >
          ← Voltar
        </Link>

        <section className="mt-6 rounded-lg border border-green-700 bg-green-900/30 p-6">
          <h1 className="text-3xl font-bold">
            🥘 Cozinhar com o que tenho
          </h1>

          <p className="mt-2 text-gray-300">
            Informe os ingredientes disponíveis e encontraremos receitas que
            podem ser preparadas com eles.
          </p>
        </section>

        <section className="mt-8 rounded-lg border border-gray-700 bg-gray-900 p-6">
          <label
            htmlFor="ingredientes"
            className="mb-2 block font-semibold"
          >
            Quais ingredientes você tem?
          </label>

          <textarea
            id="ingredientes"
            value={ingredientes}
            onChange={(e) => {
              setIngredientes(e.target.value);
              setMensagem("");
            }}
            placeholder="Ex.: arroz, frango, cebola, tomate..."
            rows={6}
            className="w-full rounded-lg border border-gray-700 bg-black p-4 text-white outline-none focus:border-green-500"
          />

          {mensagem && (
            <p className="mt-3 text-sm font-semibold text-red-400">
              ⚠️ {mensagem}
            </p>
          )}

          <button
            type="button"
            onClick={procurarReceitas}
            disabled={!carregado}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregado
              ? "🔍 Procurar receitas"
              : "Carregando receitas..."}
          </button>
        </section>

        {buscaRealizada && (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Receitas encontradas
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {resultados.length === 1
                  ? "1 receita combina com os ingredientes informados."
                  : `${resultados.length} receitas combinam com os ingredientes informados.`}
              </p>
            </div>

            {resultados.length === 0 ? (
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
                <p className="font-semibold text-yellow-400">
                  Nenhuma receita encontrada.
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Informe outros ingredientes e faça uma nova busca.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {resultados.map(
                  ({ receita, ingredientesEncontrados }) => (
                    <article
                      key={receita.id}
                      className="flex gap-4 rounded-lg border border-gray-700 bg-gray-900 p-5"
                    >
                      {receita.imagem ? (
                        <img
                          src={receita.imagem}
                          alt={receita.nome}
                          className="h-20 w-24 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-20 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-800 text-2xl">
                          🍽️
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {receita.nome}
                        </h3>

                        <p className="mt-2 text-sm text-green-400">
                          {ingredientesEncontrados.length === 1
                            ? "1 ingrediente encontrado"
                            : `${ingredientesEncontrados.length} ingredientes encontrados`}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {ingredientesEncontrados.join(", ")}
                        </p>

                        <Link
                          href={`/receita/${receita.id}`}
                          className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700"
                        >
                          Ver receita
                        </Link>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}