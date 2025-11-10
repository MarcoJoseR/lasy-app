import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

interface Receita {
  id: number;
  nome: string;
  categoria?: string;
  imagem_url?: string;
  modo_preparo?: string;
  created_at?: string;
}

interface ReceitasContextProps {
  receitas: Receita[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  saveScrollPos: (pos: number) => void;
  restoreScrollPos: () => void;
}

const ReceitasContext = createContext<ReceitasContextProps | undefined>(undefined);
const RECEITAS_PAGE_SIZE = 6;

export const ReceitasProvider = ({ children }: { children: ReactNode }) => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [savedScrollPos, setSavedScrollPos] = useState(0);
  const router = useRouter();

  const saveScrollPos = (pos: number) => setSavedScrollPos(pos);
  const restoreScrollPos = () => window.scrollTo(0, savedScrollPos);

  const fetchReceitas = async (nextPage: number) => {
    setIsLoading(true);
    try {
      const from = nextPage * RECEITAS_PAGE_SIZE;
      const to = from + RECEITAS_PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("receitas")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data?.length) {
        setReceitas(prev => (nextPage === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === RECEITAS_PAGE_SIZE);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erro ao buscar receitas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (isLoading || !hasMore) return;
    fetchReceitas(page + 1);
  };

  useEffect(() => {
    fetchReceitas(0);
  }, []);

  useEffect(() => {
    const handleRouteChangeComplete = () => restoreScrollPos();
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => router.events.off("routeChangeComplete", handleRouteChangeComplete);
  }, [savedScrollPos, router.events]);

  return (
    <ReceitasContext.Provider
      value={{ receitas, isLoading, hasMore, page, loadMore, saveScrollPos, restoreScrollPos }}
    >
      {children}
    </ReceitasContext.Provider>
  );
};

export const useReceitas = () => {
  const context = useContext(ReceitasContext);
  if (!context) throw new Error("useReceitas deve ser usado dentro de ReceitasProvider");
  return context;
};
