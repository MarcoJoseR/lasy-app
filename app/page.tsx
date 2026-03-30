"use client";

import { useState, useEffect } from "react";
import { receitas as receitasIniciais } from "./data/receitas";
import CardReceita from "./components/CardReceita";
import Link from "next/link";

export default function Page() {
  // 🔹 estados principais
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [busca, setBusca] = useState("");

  const [receitas, setReceitas] = useState(receitasIniciais);

 
  // ✅ 👉 ADICIONE AQUI 👇
  const [entradaIngredientes, setEntradaIngredientes] = useState("");
  const [sugestoes, setSugestoes] = useState([]);

  // 🔹 função nova
  function sugerirReceitas(ingredientesUsuario, receitas) {
    return receitas.filter((receita) =>
      receita.ingredientes.some((ing) => {
        const ingLimpo = ing
          .toLowerCase()
          .replace(/[0-9]/g, "")
          .replace(/g|ml/g, "")
          .trim();

        return ingredientesUsuario.some((userIng) =>
          ingLimpo.includes(userIng)
        );
      })
    );
  }

  function buscarSugestoes() {
  const ingredientesUsuario = entradaIngredientes
    .toLowerCase()
    .split(",")
    .map(i => i.trim());

  const resultado = sugerirReceitas(ingredientesUsuario, receitas);

  setSugestoes(resultado);
}
  // 🔹 tipo
  const [tipo, setTipo] = useState("comida");
  const [tipoAtivo, setTipoAtivo] = useState("comida");

  // 🔹 formulário
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");

  // 🔹 carregar do localStorage ao iniciar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem("receitas");

    if (dadosSalvos) {
      setReceitas(JSON.parse(dadosSalvos));
    } else {
      setReceitas(receitasIniciais);
    }
  }, []);

  // 🔹 salvar no localStorage sempre que mudar
  useEffect(() => {
    if (receitas.length > 0) {
      localStorage.setItem("receitas", JSON.stringify(receitas));
    }
  }, [receitas]);

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
const receitasFiltradas = receitas.filter((receita) => {
  const matchCategoria =
    categoriaAtiva === "Todas" || receita.categoria === categoriaAtiva;

  const matchBusca =
    !busca || receita.nome.toLowerCase().includes(busca.toLowerCase());

  return matchCategoria && matchBusca;
});

console.log("Receitas:", receitas);
console.log("Filtradas:", receitasFiltradas);
  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">

      {/* 🔍 BUSCA */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar receita..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
        />
{/* 🍳 BUSCA POR INGREDIENTES */}
<div className="mb-6 space-y-2">
  <input
    type="text"
    placeholder="Buscar por ingredientes (ex: feijão, arroz)"
    value={entradaIngredientes}
    onChange={(e) => setEntradaIngredientes(e.target.value)}
    className="w-full p-3 rounded-xl bg-zinc-800 text-white"
  />

  <button
    onClick={buscarSugestoes}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Buscar por ingredientes
  </button>
</div>

        {busca && (
          <button
            onClick={() => setBusca("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* ➕ FORMULÁRIO */}
      <div className="bg-zinc-900 p-5 rounded-xl space-y-4 shadow-md">
        <h2 className="text-xl font-semibold">Adicionar Receita</h2>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 text-white"
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

{sugestoes.length > 0 && (
  <div>
    <h2>🍳 Sugestões:</h2>
    {sugestoes.map((r) => (
      <p key={r.id}>{r.nome}</p>
    ))}
  </div>
)}
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