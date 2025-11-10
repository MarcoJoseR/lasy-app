// pages/categoria/[categoria].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import Layout from "../../components/Layout";
import RecipeCard from "../../components/RecipeCard";

interface Receita {
  id: number;
  nome: string;
  descricao: string;
  imagem_url?: string;
  ingredientes: string[];
}

interface Subcategoria {
  id: number;
  nome: string;
  categoria_id: number;
  receitas: Receita[];
}

const CategoriaPage = () => {
  const router = useRouter();
  const { categoria } = router.query;

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoria) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Pegando categoria
        const { data: catData } = await supabase
          .from("categorias")
          .select("*")
          .eq("nome", categoria)
          .single();

        if (!catData) {
          setSubcategorias([]);
          return;
        }

        const categoriaId = catData.id;

        // Pegando subcategorias da categoria
        const { data: subData } = await supabase
          .from("subcategorias")
          .select("*")
          .eq("categoria_id", categoriaId)
          .order("id");

        if (!subData) {
          setSubcategorias([]);
          return;
        }

        // Para cada subcategoria, buscar receitas
        const subcategoriasComReceitas: Subcategoria[] = await Promise.all(
          subData.map(async (sub: any) => {
            const { data: receitas } = await supabase
              .from("receitas")
              .select("*")
              .eq("subcategoria_id", sub.id)
              .order("id");

            return {
              ...sub,
              receitas: receitas || [],
            };
          })
        );

        setSubcategorias(subcategoriasComReceitas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoria]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {categoria}
      </h1>

      {loading && <p>Carregando...</p>}

      {!loading && subcategorias.length === 0 && (
        <p className="text-gray-500">Nenhuma receita encontrada.</p>
      )}

      {!loading &&
        subcategorias.map((sub) => (
          <div key={sub.id} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{sub.nome}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sub.receitas.map((r) => (
                <RecipeCard
                  key={r.id}
                  id={r.id}
                  nome={r.nome}
                  descricao={r.descricao}
                  imagem_url={r.imagem_url}
                  ingredientes={r.ingredientes}
                />
              ))}
            </div>
          </div>
        ))}
    </Layout>
  );
};

export default CategoriaPage;
