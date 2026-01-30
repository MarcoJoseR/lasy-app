"use client";

import { useEffect, useState } from "react";
import FavoritoButton from "@/components/FavoritoButton";
import AdicionarRefeicaoButton from "@/components/AdicionarRefeicaoButton";
import {
  FaCocktail,
  FaAppleAlt,
  FaBreadSlice,
  FaCookie,
  FaClock,
  FaUtensils,
  FaListOl,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Categoria → ícone, badge e fundo
const categoriaInfo: Record<
  string,
  { icon: JSX.Element; badgeColor: string; bgColor: string }
> = {
  bebidas: {
    icon: <FaCocktail />,
    badgeColor: "bg-blue-200 text-blue-900",
    bgColor: "bg-blue-50",
  },
  frutas: {
    icon: <FaAppleAlt />,
    badgeColor: "bg-green-200 text-green-900",
    bgColor: "bg-green-50",
  },
  paes: {
    icon: <FaBreadSlice />,
    badgeColor: "bg-yellow-200 text-yellow-900",
    bgColor: "bg-yellow-50",
  },
  doces: {
    icon: <FaCookie />,
    badgeColor: "bg-pink-200 text-pink-900",
    bgColor: "bg-pink-50",
  },
};

type Ingrediente = { item: string };

type Receita = {
  id: number;
  nome: string;
  porcoes: number;
  favorito: boolean;
  categoria: string;
  descricao: string;
  imagem_url: string;
  dificuldade: string;
  ingredientes: string;
  modo_preparo: string;
};

type Ocorrencia = {
  id: number;
  quantidade: number;
  hora: string;
};

type RefeicaoDoDia = {
  receita: Receita;
  ocorrencias: Ocorrencia[];
};

export default function MeuDiaPage() {
  const [refeicoes, setRefeicoes] = useState<RefeicaoDoDia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/refeicoes-dia")
      .then((res) => res.json())
      .then((data) => {
        setRefeicoes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-6 text-gray-600">
        Carregando refeições...
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Cabeçalho */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Meu Dia</h1>
        {refeicoes.length > 0 && (
          <span className="inline-block mt-2 px-4 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
            Último dia registrado
          </span>
        )}
      </div>

      {refeicoes.length === 0 && (
        <p className="text-center text-gray-600">
          Nenhuma refeição registrada ainda.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {refeicoes.map(({ receita, ocorrencias }, index) => {
          const categoria =
            categoriaInfo[receita.categoria] || {
              icon: <FaUtensils />,
              badgeColor: "bg-gray-200 text-gray-900",
              bgColor: "bg-gray-50",
            };

          const quantidadeTotal = ocorrencias.reduce(
            (sum, o) => sum + o.quantidade,
            0
          );

          const ultimaHora =
            ocorrencias[ocorrencias.length - 1]?.hora?.slice(0, 5);

         const ingredientes: { item: string }[] = receita?.ingredientes
          ? JSON.parse(receita.ingredientes)
          : [];

          const passos = receita.modo_preparo
            .split(/\d+\.\s+/)
            .filter(Boolean);

          return (
            <motion.div
              key={receita.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rounded-2xl shadow-md hover:shadow-xl transition-shadow ${categoria.bgColor}`}
            >
              {/* Imagem */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <img
                  src={receita.imagem_url}
                  alt={receita.nome}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
                <span
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${categoria.badgeColor}`}
                >
                  {categoria.icon} {receita.categoria}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold">{receita.nome}</h2>
                  <p className="text-gray-700 text-sm mt-1">
                    {receita.descricao}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>{receita.porcoes} porção(ões)</span>
                  <span>⚡ {receita.dificuldade}</span>
                  <span>Consumida: {quantidadeTotal}x</span>
                </div>

                <div className="flex gap-3">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <FavoritoButton
                      receitaId={receita.id}
                      favorito={receita.favorito}
                    />
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <AdicionarRefeicaoButton receitaId={receita.id} />
                  </motion.div>
                </div>

{/* INGREDIENTES */}
<div className="mt-3">
  <h3 className="font-semibold text-lg mb-2">Ingredientes</h3>

  <div className="space-y-1">
    {ingredientes.map((ing, idx) => (
      <div key={idx} className="flex">
        <span className="w-4">• </span>
        <span>{ing.item.replace(/^•\s*/, "")}</span>
      </div>
    ))}
  </div>
</div>
                {/* Modo de preparo */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <FaListOl /> Modo de preparo
                  </h3>
                  <ol className="mt-2 space-y-2 text-sm list-decimal list-inside">
                    {passos.map((passo, idx) => (
                      <li key={idx}>{passo.trim()}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <FaClock />
                  <span>Última hora: {ultimaHora}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
