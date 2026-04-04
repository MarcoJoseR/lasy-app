"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReceitaPage() {
  const params = useParams();
  const [receita, setReceita] = useState<any>(null);

  useEffect(() => {
    const salvas = localStorage.getItem("receitas");

    if (salvas) {
      const lista = JSON.parse(salvas);

      const encontrada = lista.find(
        (r: any) => r.id === Number(params.id)
      );

      setReceita(encontrada);
    }
  }, [params.id]);

  if (!receita) {
    return <p className="p-6">Receita não encontrada</p>;
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{receita.nome}</h1>

      <img
        src={receita.imagem}
        className="w-full max-w-md rounded"
      />

      <p>Categoria: {receita.categoria}</p>
      <p>Tipo: {receita.tipo}</p>
      
<div className="mt-4">
  <h3 className="text-lg font-semibold">Ingredientes:</h3>

  {receita.ingredientes && receita.ingredientes.length > 0 ? (
    <ul className="list-disc ml-5">
      {receita.ingredientes.map((ing, i) => (
        <li key={i}>{ing}</li>
      ))}
    </ul>
  ) : (
    <p className="text-zinc-400">Sem ingredientes cadastrados</p>
  )}
</div>
    </main>
  );
}
