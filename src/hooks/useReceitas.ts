// C:\supabase-app\src\hooks\useReceitas.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Receita {
  id: number;
  titulo: string;
  categoria?: string;
  ingredientes: string[];
  modo_preparo: string;
  imagem_url?: string | null;
  tempo?: string;
}

const ITENS_POR_PAGINA = 6;

export const useReceitas = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [pagina, setPagina] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollPos = useRef(0);

  const fetchReceitas = useCallback(async () => {
    setIsLoading(true);
    try {
      const inicio = pagina * ITENS_POR_PAGINA;
      const fim = inicio + ITENS_POR_PAGINA - 1;

      const { data, error } = await supabase
        .from("receitas")
        .select("*")
        .order("id", { ascending: false })
        .range(inicio, fim);

      if (error) throw error;

      if (data && data.length > 0) {
        const novasReceitas = data.map((r: any) => ({
          ...r,
          titulo: r.titulo || r.nome || "Receita sem título",
          ingredientes: Array.isArray(r.ingredientes)
            ? r.ingredientes
            : typeof r.ingredientes === "string"
            ? [r.ingredientes]
            : [],
          imagem_url:
            r.imagem_url && r.imagem_url.trim() !== ""
              ? r.imagem_url
              : "/images/fallback-img.jpg",
        }));

        setReceitas((prev) => [...prev, ...novasReceitas]);
        if (data.length < ITENS_POR_PAGINA) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Erro ao buscar receitas:", err.message);
      setError(err.message || "Erro ao carregar receitas");
    } finally {
      setIsLoading(false);
    }
  }, [pagina]);

  useEffect(() => {
    fetchReceitas();
  }, [fetchReceitas]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPagina((p) => p + 1);
    }
  }, [isLoading, hasMore]);

  const saveScrollPos = useCallback((pos: number) => {
    scrollPos.current = pos;
  }, []);

  return {
    receitas,
    isLoading,
    hasMore,
    error,
    loadMore,
    saveScrollPos,
  };
};
