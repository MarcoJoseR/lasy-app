"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReceitaCard from "./ReceitaCard";
import ReceitaCardSkeleton from "./ReceitaCardSkeleton";

// Ordem de categorias
const ORDEM_CATEGORIAS = [
  "cafe-manha",
  "brasileira",
  "bebida",
  "americana",
  "europeia",
  "lanche",
  "massa",
  "doce",
  "salgado",
  "sobremesa",
  "sopa",
  "salada",
  "carne",
  "low-carb",
  "sem-gluten",
  "receita-rapida",
  "semanal",
  "latina",
];

const MAPA_CATEGORIAS: Record<string, string> = {
  "cafe-manha": "Café da Manhã",
  brasileira: "Brasileira",
  bebida: "Bebidas",
  americana: "Americana",
  europeia: "Europeia",
  lanche: "Lanches",
  massa: "Massas",
  doce: "Doces",
  salgado: "Salgados",
  sobremesa: "Sobremesas",
  sopa: "Sopas",
  salada: "Saladas",
  carne: "Carnes",
  "low-carb": "Low Carb",
  "sem-gluten": "Sem Glúten",
  "receita-rapida": "Receitas Rápidas",
  semanal: "Semanal",
  latina: "Latina",
};

interface Receita {
  id: string;
  nome: string;
  descricao: string;
  imagem?: string;
  categoria_slug: string;
  subcategoria: string;
}

// Normaliza slug
function normalizarSlug(valor?: string) {
  if (!valor) return "";
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Humaniza subcategoria
function humanizarSubcategoria(slug: string) {
  const mapa: Record<string, string> = {
    paulista: "Paulista",
    paraense: "Paraense",
    gaucha: "Gaúcha",
  };
  return mapa[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function HomeRail() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [meuDia, setMeuDia] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Agrupa por categoria -> subcategoria
  const agrupado = useMemo(() => {
    const estrutura: Record<string, Record<string, Receita[]>> = {};
    for (const receita of receitas) {
      const categoria = normalizarSlug(receita.categoria_slug);
      const subcategoria = normalizarSlug(receita.subcategoria);

      if (!estrutura[categoria]) estrutura[categoria] = {};
      if (!estrutura[categoria][subcategoria]) estrutura[categoria][subcategoria] = [];

      estrutura[categoria][subcategoria].push(receita);
    }
    return estrutura;
  }, [receitas]);

  useEffect(() => {
    async function fetchReceitas() {
      try {
        setLoading(true);
        const res = await fetch("/api/receitas");
        const data: Receita[] = await res.json();
        setReceitas(data);
        console.log("AGRUPADO:", data);
      } catch (err) {
        console.error("Erro ao carregar receitas:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReceitas();

    // Carrega favoritos e meuDia do localStorage
    const fav = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const md = JSON.parse(localStorage.getItem("meuDia") || "[]");
    setFavoritos(fav);
    setMeuDia(md);
  }, []);

  const handleToggleFavorito = useCallback((id: string) => {
    setFavoritos((prev) => {
      const novo = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("favoritos", JSON.stringify(novo));
      return novo;
    });
  }, []);

  const handleAdicionarMeuDia = useCallback((id: string) => {
    setMeuDia((prev) => {
      const novo = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("meuDia", JSON.stringify(novo));
      return novo;
    });
  }, []);

  return (
    <div className="space-y-12 p-4">
      {ORDEM_CATEGORIAS.map((categoriaSlug) => {
        const bloco = agrupado[categoriaSlug];
        if (!bloco) return null;

        return (
          <div key={categoriaSlug} className="space-y-8">
            <h1 className="text-2xl font-bold bg-red-500 text-white p-4">
              {MAPA_CATEGORIAS[categoriaSlug] || categoriaSlug}
            </h1>

            {Object.entries(bloco).map(([subSlug, lista]) => {
              if (!lista || lista.length === 0) return null;

              return (
                <section key={subSlug}>
                  <h2 className="text-lg font-semibold mb-3">
                    {humanizarSubcategoria(subSlug)}
                  </h2>

       <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
  {loading
    ? Array.from({ length: 3 }).map((_, i) => (
        <ReceitaCardSkeleton key={i} />
      ))
    : lista.map((receita) => (
        <ReceitaCard
          key={receita.id}
          receita={receita}
          isFavorito={favoritos.includes(receita.id)}
          isMeuDia={meuDia.includes(receita.id)}
          onToggleFavorito={handleToggleFavorito}
          onAddMeuDia={handleAdicionarMeuDia}
        />
      ))}
</div>
                 </section>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
