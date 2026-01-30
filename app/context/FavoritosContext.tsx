"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface FavoritosContextProps {
  favoritos: number[];
  setFavoritos: React.Dispatch<React.SetStateAction<number[]>>;
}

const FavoritosContext = createContext<FavoritosContextProps | undefined>(undefined);

export const FavoritosProvider = ({ children }: { children: ReactNode }) => {
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await fetch("/api/favoritos");
        const json = await res.json();

        if (json?.data) {
          setFavoritos(json.data.map((f: any) => f.receita_id));
        }
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    };

    fetchFavoritos();
  }, []);

  return (
    <FavoritosContext.Provider value={{ favoritos, setFavoritos }}>
      {children}
    </FavoritosContext.Provider>
  );
};

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);

  if (!context) {
    throw new Error("useFavoritos deve ser usado dentro de FavoritosProvider");
  }

  return context;
};
