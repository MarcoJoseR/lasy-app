"use client";

import { useEffect } from "react";
import { useMeuDia } from "@/app/context/MeuDiaContext";

export default function MeuDiaPage() {
  const { refeicoes, carregando, carregarMeuDia } = useMeuDia();

  useEffect(() => {
    carregarMeuDia();
  }, []);

  if (carregando) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Meu Dia</h1>
        <p>Carregando refeições do dia...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Meu Dia</h1>

      <Periodo titulo="Café da Manhã" itens={refeicoes.cafe} />
      <Periodo titulo="Almoço" itens={refeicoes.almoco} />
      <Periodo titulo="Lanche" itens={refeicoes.lanche} />
      <Periodo titulo="Jantar" itens={refeicoes.jantar} />
    </div>
  );
}

/* ======================================================
   COMPONENTE AUXILIAR
====================================================== */

function Periodo({
  titulo,
  itens,
}: {
  titulo: string;
  itens: {
    id: string;
    receita_nome: string;
    receita_imagem: string;
  }[];
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">{titulo}</h2>

      {itens.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma refeição registrada.</p>
      ) : (
        <ul className="space-y-2">
          {itens.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border rounded-md p-2"
            >
              <img
                src={item.receita_imagem || "/images/receitas/sem-imagem.jpg"}
                alt={item.receita_nome}
                className="w-12 h-12 object-cover rounded"
              />
              <span>{item.receita_nome}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
