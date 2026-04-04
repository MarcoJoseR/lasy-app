"use client";

import { useState } from "react";
import CardReceita from "./components/CardReceita"; // Import correto

export default function Page() {
  const [receitas, setReceitas] = useState<any[]>([]);

  const categorias = ["massa", "bebida", "comida", "sobremesa", "café da manhã"];

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");
  const [ingredientes, setIngredientes] = useState([""]);
  const [tempo, setTempo] = useState("");
  const [preparo, setPreparo] = useState("");

  // Adicionar receita
  const adicionarReceita = () => {
    if (!nome || !categoria) return;

    const novaReceita = {
      id: Date.now(),
      nome,
      categoria,
      imagem,
      ingredientes: ingredientes.filter((i) => i.trim() !== ""),
      tempo,
      preparo,
      favorito: false,
    };

    setReceitas((prev) => [novaReceita, ...prev]);

    // Resetar formulário
    setNome("");
    setCategoria("");
    setImagem("");
    setIngredientes([""]);
    setTempo("");
    setPreparo("");
  };

  const adicionarIngrediente = () => setIngredientes([...ingredientes, ""]);
  const atualizarIngrediente = (index: number, valor: string) => {
    const copia = [...ingredientes];
    copia[index] = valor;
    setIngredientes(copia);
  };

  // Funções do CardReceita
  const handleEditar = (receitaEditada: any) => {
    setReceitas((prev) =>
      prev.map((r) => (r.id === receitaEditada.id ? receitaEditada : r))
    );
  };

  const handleRemover = (receitaRemovida: any) => {
    setReceitas((prev) => prev.filter((r) => r.id !== receitaRemovida.id));
  };

  const handleFavorito = (receitaFavorito: any) => {
    setReceitas((prev) =>
      prev.map((r) =>
        r.id === receitaFavorito.id ? { ...r, favorito: !r.favorito } : r
      )
    );
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      {/* FORMULÁRIO DE ADICIONAR RECEITA */}
      <div className="p-4 border rounded-2xl shadow-lg space-y-3 bg-white">
        <h2 className="text-xl font-bold">Adicionar Nova Receita</h2>

        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Nome da receita"
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="URL da imagem"
        />

        {/* Ingredientes */}
        <div className="space-y-1">
          <label className="font-medium">Ingredientes:</label>
          {ingredientes.map((ing, idx) => (
            <input
              key={idx}
              value={ing}
              onChange={(e) => atualizarIngrediente(idx, e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={`Ingrediente ${idx + 1}`}
            />
          ))}
          <button
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            onClick={adicionarIngrediente}
          >
            + Adicionar ingrediente
          </button>
        </div>

        <input
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Tempo de preparo"
        />

        <textarea
          value={preparo}
          onChange={(e) => setPreparo(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Modo de preparo"
        />

        <button
          onClick={adicionarReceita}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
        >
          💾 Adicionar Receita
        </button>
      </div>

      {/* LISTA DE CARDS */}
      <div className="space-y-4">
        {receitas.map((receita) => (
          <CardReceita
            key={receita.id}
            receita={receita}
            categorias={categorias}
            onEditar={handleEditar}
            onRemover={handleRemover}
            onFavorito={handleFavorito}
          />
        ))}
      </div>
    </main>
  );
}