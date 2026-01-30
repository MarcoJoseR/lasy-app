"use client";

import { Heart } from "lucide-react";
import { useFavorito } from "@/app/hooks/useFavorito";

interface FavoritoButtonProps {
  id: number;
}

export default function FavoritoButton({ id }: FavoritoButtonProps) {
  const { favorito, toggleFavorito } = useFavorito(false, id);

  return (
    <button onClick={toggleFavorito} aria-label="Favoritar receita">
      <Heart
        size={20}
        className={favorito ? "text-red-500 fill-red-500" : "text-gray-400"}
      />
    </button>
  );
}
