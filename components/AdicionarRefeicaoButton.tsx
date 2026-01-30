"use client";

import { useState } from "react";

interface AdicionarRefeicaoButtonProps {
  receitaId: number;
}

export default function AdicionarRefeicaoButton({ receitaId }: AdicionarRefeicaoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [adicionado, setAdicionado] = useState(false);

  const adicionarRefeicao = async () => {
    setLoading(true);
    try {
      await fetch("/api/adicionar-refeicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receitaId }),
      });
      setAdicionado(true);
    } catch (error) {
      console.error("Erro ao adicionar refeição:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={adicionarRefeicao}
      disabled={loading || adicionado}
      className={`px-3 py-1 rounded-lg text-white font-medium transition-colors duration-200
        ${adicionado ? "bg-green-500 cursor-default" : "bg-blue-500 hover:bg-blue-600"}
      `}
    >
      {adicionado ? "Adicionado" : "Adicionar Refeição"}
    </button>
  );
}
