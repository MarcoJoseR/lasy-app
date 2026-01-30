"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FavoritasPage() {
  type ReceitaFavorita = {
  id: number;
  slug: string;
  nome: string;
};

const [receitas, setReceitas] = useState<ReceitaFavorita[]>([]);


  useEffect(() => {
    async function carregar() {
      const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");

      if (favs.length === 0) return;

      fetch("/api/receitas-por-id", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ids: favs }),
});

if (receitas.length === 0) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Favoritas</h1>
      <p>Nenhuma receita favoritada ainda.</p>
    </div>
  );
}
      const data = await res.json();
      setReceitas(data);
    }

    carregar();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Favoritas</h1>

      {receitas.map((r) => (
        <Link key={r.id} href={`/receita/${r.slug}`}>
          <p className="underline">{r.nome}</p>
        </Link>
      ))}
    </div>
  );
}
