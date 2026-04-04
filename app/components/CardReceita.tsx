"use client";

import { useState } from "react";

interface CardProps {
  receita: any;
  categorias: string[];
  onEditar?: (r: any) => void;
  onRemover?: (r: any) => void;
  onFavorito?: (r: any) => void;
}

export default function CardReceita({
  receita,
  categorias,
  onEditar,
  onRemover,
  onFavorito,
}: CardProps) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(receita.nome);
  const [categoria, setCategoria] = useState(receita.categoria);
  const [imagem, setImagem] = useState(receita.imagem);
  const [ingredientes, setIngredientes] = useState(receita.ingredientes || [""]);
  const [tempo, setTempo] = useState(receita.tempo || "");
  const [preparo, setPreparo] = useState(receita.preparo || "");

  const salvar = () => {
    onEditar &&
      onEditar({
        ...receita,
        nome,
        categoria,
        imagem,
        ingredientes: ingredientes.filter((i) => i.trim() !== ""),
        tempo,
        preparo,
      });
    setEditando(false);
  };

  const cancelar = () => {
    setNome(receita.nome);
    setCategoria(receita.categoria);
    setImagem(receita.imagem);
    setIngredientes(receita.ingredientes || [""]);
    setTempo(receita.tempo || "");
    setPreparo(receita.preparo || "");
    setEditando(false);
  };

  const adicionarIngrediente = () => setIngredientes([...ingredientes, ""]);
  const atualizarIngrediente = (index: number, valor: string) => {
    const copia = [...ingredientes];
    copia[index] = valor;
    setIngredientes(copia);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] ${
        editando ? "bg-gray-50 ring-2 ring-yellow-400" : "bg-black"
      }`}
    >
      {editando ? (
        <div className="p-4 space-y-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder="Nome"
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          >
            <option value="">Selecione uma categoria</option>
            {categoria && !categorias.includes(categoria) && (
              <option value={categoria}>{categoria}</option>
            )}
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder="URL da imagem"
          />

          {imagem && (
            <img
              src={imagem}
              alt="preview"
              className="w-full h-32 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
            />
          )}

          <div className="space-y-1">
            <label className="font-medium">Ingredientes:</label>
            {ingredientes.map((ing, idx) => (
              <input
                key={idx}
                value={ing}
                onChange={(e) => atualizarIngrediente(idx, e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder={`Ingrediente ${idx + 1}`}
              />
            ))}
            <button
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition transform hover:scale-105"
              onClick={adicionarIngrediente}
            >
              + Adicionar ingrediente
            </button>
          </div>

          <input
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder="Tempo de preparo"
          />

          <textarea
            value={preparo}
            onChange={(e) => setPreparo(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder="Modo de preparo"
          />

          <div className="flex justify-between">
            <button
              onClick={salvar}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
            >
              💾 Salvar
            </button>
            <button
              onClick={cancelar}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <img
            src={receita.imagem || "/default.jpg"}
            alt={receita.nome}
            className="w-full h-48 object-cover rounded-t-2xl opacity-90 transition-transform duration-300 hover:scale-105"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditando(true);
            }}
            className="absolute top-2 right-2 z-10 bg-black/70 text-white px-2 py-1 rounded-lg hover:bg-black/90 transition transform hover:scale-110"
          >
            ✏️
          </button>

          <div className="absolute bottom-16 left-4">
            <h2 className="text-xl font-bold text-white drop-shadow">
              {receita.nome}
            </h2>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex gap-2">
            <button
              className={`flex items-center justify-center gap-1 py-[0.375rem] px-[0.5rem] rounded-xl text-sm font-medium transition-all duration-150 backdrop-blur-sm transform hover:scale-105 ${
                receita.favorito
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
              onClick={() => onFavorito && onFavorito(receita)}
            >
              ⭐ {receita.favorito ? "Remover" : "Favoritar"}
            </button>

            <button
              className="flex items-center justify-center gap-1 py-[0.375rem] px-[0.5rem] rounded-xl text-sm font-medium transition-all duration-150 bg-black/70 text-white hover:bg-black/90 backdrop-blur-sm transform hover:scale-105"
              onClick={() => onRemover && onRemover(receita)}
            >
              🗑️ Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
}