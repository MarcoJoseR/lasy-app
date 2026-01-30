import Layout from "../../../components/Layout";
import CardReceita from "../../../components/CardReceita";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Receita {
  id: number;
  nome: string;
  descricao: string;
  categoria_id: number;
  subcategoria_nome?: string;
  imagem_url: string;
}

interface Props {
  params: { categoriaId: string };
}

export default async function ReceitasCategoria({ params }: Props) {
  const { categoriaId } = params;

  const { data: receitas, error } = await supabase
    .from<Receita>("receitas")
    .select("*")
    .eq("categoria_id", categoriaId);

  if (error || !receitas?.length) return <Layout><p>Não há receitas nesta categoria.</p></Layout>;

  // Agrupa por subcategoria
  const subcategoriasMap: Record<string, Receita[]> = {};
  receitas.forEach((r) => {
    const sub = r.subcategoria_nome || "Geral";
    if (!subcategoriasMap[sub]) subcategoriasMap[sub] = [];
    subcategoriasMap[sub].push(r);
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Receitas da Categoria {categoriaId}</h1>
      {Object.entries(subcategoriasMap).map(([sub, list]) => (
        <div key={sub} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{sub}</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {list.map((r) => (
              <CardReceita
                key={r.id}
                id={r.id}
                nome={r.nome}
                descricao={r.descricao}
                categoria_id={r.categoria_id}
                imagem_url={r.imagem_url}
              />
            ))}
          </div>
        </div>
      ))}
    </Layout>
  );
}
