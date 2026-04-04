"use client";

import { useState } from "react";
import { receitas as receitasIniciais } from "./data/receitas";
import CardReceita from "./components/CardReceita";

export default function Page() {
  // 🔹 Estados principais
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [busca, setBusca] = useState("");

  // 🔹 Filtragem de receitas
  const receitasFiltradas = receitasIniciais.filter((receita) => {
    const matchCategoria =
      categoriaAtiva === "Todas" || receita.categoria === categoriaAtiva;

    const matchBusca =
      !busca || receita.nome.toLowerCase().includes(busca.toLowerCase());

    return matchCategoria && matchBusca;
  });

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      {/* 🔹 Barra de busca */}
      <input
        type="text"
        placeholder="Buscar receita..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* 🔹 Filtro de categorias */}
      <div className="flex gap-2">
        {["Todas", "Entrada", "Prato Principal", "Sobremesa"].map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded ${
              categoriaAtiva === cat ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🔹 Receitas filtradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receitasFiltradas.map((r) => (
          <CardReceita key={r.id} receita={r} />
        ))}
      </div>
    </main>
  );
}