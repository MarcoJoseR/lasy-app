"use client";

import { useState } from "react";
import { receitas as receitasIniciais } from "./data/receitas";
import { CardReceita } from "./components/CardReceita";

export default function Page() {
  // 🔹 estados principais
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [busca, setBusca] = useState("");

  const [receitas, setReceitas] = useState(receitasIniciais);

  // 🔹 tipo
  const [tipo, setTipo] = useState("comida");
  const [tipoAtivo, setTipoAtivo] = useState("comida");

  // 🔹 formulário
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");

  // 🔹 categorias dinâmicas
  const categorias = [
    "Todas",
    ...Array.from(new Set(receitas.map((r) => r.categoria))),
  ];

  function adicionarReceita() {
    if (!nome || !categoria) return;

    const nova = {
      id: Date.now(),
      nome,
      categoria,
      imagem,
      tipo,
    };

    setReceitas((prev) => [nova, ...prev]);

    setNome("");
    setCategoria("");
    setImagem("");
  }

  // 🔹 filtros
  const receitasFiltradas = receitas
    .filter((r) => r.tipo === tipoAtivo)
    .filter((r) =>
      categoriaAtiva === "Todas" ? true : r.categoria === categoriaAtiva
    )
    .filter((r) =>
      r.nome.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <main className="p-6 max-w-4xl mx-auto">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold mb-2 text-white">
        🍳 Lasy Receitas
      </h1>

      <p className="text-zinc-400 mb-6">
        Descubra pratos incríveis todos os dias
      </p>

      {/* 🔍 BUSCA */}
      <input
        type="text"
        placeholder="Buscar receita..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full p-3 mb-6 rounded-xl bg-zinc-800 text-white"
      />

      {/* ➕ FORMULÁRIO */}
      <div className="mb-6 p-4 bg-zinc-900 rounded-xl space-y-3">
        <h2 className="text-white font-semibold">Adicionar Receita</h2>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />

        <input
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />

        <input
          placeholder="URL da imagem"
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />

        {/* TIPO */}
        <label className="text-zinc-400 text-sm">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        >
          <option value="comida">Comida</option>
          <option value="bebida">Bebida</option>
        </select>

        <button
          onClick={adicionarReceita}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      {/* 🔵 FILTRO TIPO */}
      <div className="flex gap-2 mb-4">
        {["comida", "bebida"].map((t) => (
          <button
            key={t}
            onClick={() => setTipoAtivo(t)}
            className={`px-3 py-1 rounded-full ${
              tipoAtivo === t
                ? "bg-white text-black"
                : "bg-zinc-800 text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 🧭 CATEGORIAS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-3 py-1 rounded-full ${
              categoriaAtiva === cat
                ? "bg-white text-black"
                : "bg-zinc-800 text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📦 LISTA */}
      {receitasFiltradas.length === 0 ? (
        <p className="text-zinc-400">
          Nenhuma receita encontrada
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {receitasFiltradas.map((receita) => (
            <CardReceita
              key={receita.id}
              receita={receita}
              busca={busca}
            />
          ))}
        </div>
      )}

    </main>
  );
}