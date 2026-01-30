"use client";

import { useState } from "react";
import Link from "next/link";

export default function BuscaReceitas() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function buscar() {
    if (termo.length < 2) return;

    setLoading(true);

    const res = await fetch("/api/busca", {
      method: "POST",
      body: JSON.stringify({ termo }),
    });

    const data = await res.json();
    setResultados(data);
    setLoading(false);
  }

  return (
    <div className="mb-6 w-full">
      <div className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="Buscar receita / ingrediente"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />

        <button
          onClick={buscar}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Buscar
        </button>
      </div>

      {loading && <p className="mt-2">Buscando...</p>}

      <ul className="mt-4 space-y-2">
        {resultados.map((r) => (
          <li key={r.id} className="border p-2 rounded">
            <Link href={`/receita/${r.slug}`}>
              <p className="font-medium">{r.nome}</p>
            </Link>
          </li>
        ))}

        {!loading && resultados.length === 0 && termo.length >= 2 && (
          <p className="text-gray-500">Nenhuma receita encontrada.</p>
        )}
      </ul>
    </div>
  );
}
