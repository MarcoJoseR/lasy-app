"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoritosPage() {
  const [receitas, setReceitas] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("receitas");
    if (data) {
      setReceitas(JSON.parse(data));
    }
  }, []);

  const handleFavorito = (r: any) => {
    const atualizadas = receitas.map((rec) =>
      rec.id === r.id ? { ...rec, favorito: !rec.favorito } : rec
    );

    setReceitas(atualizadas);
    localStorage.setItem("receitas", JSON.stringify(atualizadas));
  };

  const favoritos = receitas.filter((r) => r.favorito);

  return (
    <main className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => router.back()}
          className="bg-zinc-800 px-3 py-2 rounded hover:bg-zinc-700"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold">⭐ Favoritos</h1>
      </div>

      {favoritos.length === 0 ? (
        <p className="text-zinc-400">
          Nenhuma receita favoritada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {favoritos.map((receita) => (
            <div
              key={receita.id}
              className="bg-zinc-900 rounded-xl overflow-hidden"
            >
              <img
                src={receita.imagem || "/default.jpg"}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <h2 className="font-semibold mb-2">
                  {receita.nome}
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/receita/${receita.id}`)}
                    className="text-sm bg-green-600 px-3 py-1 rounded"
                  >
                    Ver
                  </button>

                 <button
                    onClick={() => onFavoritar(receita.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    ❌ Desfavoritar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}