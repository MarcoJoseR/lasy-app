"use client";

import { useEffect, useState } from "react";

export function useFavorito(
  id: string,
  onChange?: (id: string, novoEstado: boolean) => void
) {
  const [favorito, setFavorito] = useState<boolean>(false);

  // 🔹 Carrega o estado inicial direto do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const favoritos: string[] = JSON.parse(
      localStorage.getItem("favoritos") || "[]"
    );

    setFavorito(favoritos.includes(id));
  }, [id]);

  // 🔹 Alterna favorito e persiste
  const toggleFavorito = () => {
    const favoritos: string[] = JSON.parse(
      localStorage.getItem("favoritos") || "[]"
    );

    let atualizado: string[];

    if (favorito) {
      atualizado = favoritos.filter((fav) => fav !== id);
    } else {
      atualizado = [...favoritos, id];
    }

    localStorage.setItem("favoritos", JSON.stringify(atualizado));
    setFavorito(!favorito);

    if (onChange) onChange(id, !favorito);
  };

  return { favorito, toggleFavorito };
}
