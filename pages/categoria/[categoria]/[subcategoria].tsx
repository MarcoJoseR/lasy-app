import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../../../lib/supabaseClient";

interface Receita {
  id: number;
  nome: string;
  descricao: string;
  imagem_url?: string;
}

interface Subcategoria {
  id: number;
  nome: string;
  categoria_id: number;
}

const PAGE_SIZE = 10;

const SubcategoriaPage: React.FC = () => {
  const router = useRouter();
  const { categoria, subcategoria } = router.query;

  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [subcatData, setSubcatData] = useState<Subcategoria | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loader = useRef<HTMLDivElement | null>(null);

  const fetchReceitas = async (pageNum: number) => {
    if (!subcategoria) return;
    setLoading(true);

    // Pega a subcategoria se ainda não tiver
    if (!subcatData) {
      const { data: subData, error: subError } = await supabase
        .from("subcategorias")
        .select("*")
        .eq("id", subcategoria)
        .single();

      if (subError) {
        console.error(subError);
        setLoading(false);
        return;
      }
      setSubcatData(subData);
    }

    // Busca receitas da subcategoria com paginação
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("receitas")
      .select("*")
      .eq("subcategoria_id", subcatData?.id)
      .order("id")
      .range(from, to);

    if (error) console.error(error);
    else {
      setReceitas((prev) => [...prev, ...(data || [])]);
      if (!data || data.length < PAGE_SIZE) setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (subcategoria) fetchReceitas(1);
  }, [subcategoria, subcatData]);

  // Scroll infinito
  useEffect(() => {
    if (!loader.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          fetchReceitas(nextPage);
          setPage(nextPage);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loader.current);

    return () => observer.disconnect();
  }, [hasMore, loading, page, subcatData]);

  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => router.push(`/categoria/${categoria}`)}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Voltar
      </button>

      {subcatData && (
        <h1 className="text-3xl font-bold mb-6 capitalize">{subcatData.nome}</h1>
      )}

      {receitas.length === 0 && !loading ? (
        <p className="text-gray-500 text-center">Nenhuma receita encontrada.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receitas.map((receita) => (
              <div
                key={receita.id}
                className="cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                onClick={() => router.push(`/receita/${receita.id}`)}
              >
                <img
                  src={receita.imagem_url || "/fallback-img.jpg"}
                  alt={receita.nome}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{receita.nome}</h2>
                  <p className="text-gray-600 mt-2">{receita.descricao}</p>
                </div>
              </div>
            ))}
          </div>

          <div ref={loader} className="text-center mt-6">
            {loading && <p>Carregando mais receitas...</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default SubcategoriaPage;
