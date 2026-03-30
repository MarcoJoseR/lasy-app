"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { receitas } from "../../data/receitas";

export default function ReceitaPage({ params }: any) {
  const router = useRouter()

  const receitaBase = receitas.find(
    (r) => r.id === Number(params.id)
  );

  const [favorito, setFavorito] = useState(false)

  // 🔒 proteção
  if (!receitaBase) {
    return <div>Receita não encontrada</div>;
  }

  const receita = receitaBase;

  // 🔹 carregar favorito
  useEffect(() => {
    const dados = localStorage.getItem("favoritos")

    if (!dados) return

    const favoritos = JSON.parse(dados)

    const existe = favoritos.some((item: any) => item.id === receita.id)

    setFavorito(existe)
  }, [receita.id])

  // 🔹 toggle favorito
  const toggleFavorito = () => {
    const dados = localStorage.getItem("favoritos")
    let favoritos = dados ? JSON.parse(dados) : []

    if (favorito) {
      favoritos = favoritos.filter((item: any) => item.id !== receita.id)
    } else {
      favoritos.push(receita)
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos))
    setFavorito(!favorito)
  }

  return (
    <main className="p-6 max-w-2xl mx-auto text-white">

      {/* TOPO */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white bg-zinc-800 px-3 py-2 rounded hover:bg-zinc-700"
        >
          ← Voltar
        </button>
      </div>

      {/* TÍTULO */}
      <h1 className="text-4xl font-bold mb-2">
        {receita.nome}
      </h1>

      {/* FAVORITO */}
      <button
        onClick={toggleFavorito}
        className="mb-4 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2"
      >
        <span className="text-lg">
          {favorito ? "❤️" : "🤍"}
        </span>

        <span>
          {favorito
            ? "Remover dos favoritos"
            : "Salvar nos favoritos"}
        </span>
      </button>

      {/* CATEGORIA */}
      <span className="inline-block bg-green-700 text-white text-sm px-3 py-1 rounded-full mb-4">
        {receita.categoria}
      </span>

      {/* INFO */}
      <div className="flex gap-4 text-sm text-zinc-400 mb-6">
        <span>⏱ {receita.tempo}</span>
        <span>🍽 {receita.porcoes}</span>
      </div>

      {/* IMAGEM */}
      <img
        src={receita.imagem || "/images/receitas/sem-imagem.jpg"}
        className="w-full h-72 object-cover rounded-2xl mb-8 shadow-lg"
      />

      {/* INGREDIENTES */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🧾 Ingredientes</h2>
        <ul className="space-y-2">
          {receita.ingredientes.map((item, index) => (
            <li
              key={index}
              className="bg-zinc-800 p-3 rounded-lg"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* PREPARO */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">👨‍🍳 Modo de preparo</h2>
        <ol className="space-y-3">
          {receita.preparo.map((passo, index) => (
            <li
              key={index}
              className="bg-zinc-800 p-3 rounded-lg"
            >
              <strong>Passo {index + 1}:</strong> {passo}
            </li>
          ))}
        </ol>
      </section>

    </main>
  )
}