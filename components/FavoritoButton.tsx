"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface FavoritoButtonProps {
  receitaId: number;
  favorito: boolean;
}

export default function FavoritoButton({ receitaId, favorito }: FavoritoButtonProps) {
  const [isFavorito, setIsFavorito] = useState(favorito);
  const [loading, setLoading] = useState(false);

  const toggleFavorito = async () => {
    setLoading(true);
    try {
      // Chamada à API para atualizar o favorito
      await fetch(`/api/favorito/${receitaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorito: !isFavorito }),
      });
      setIsFavorito(!isFavorito);
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorito}
      disabled={loading}
      className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors duration-200"
      title={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isFavorito ? <FaHeart /> : <FaRegHeart />}
      <span className="hidden md:inline">{isFavorito ? "Favorita" : "Favorito"}</span>
    </button>
  );
}
