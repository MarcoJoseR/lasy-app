import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

/* =========================================================
   SEO DINÂMICO POR CATEGORIA
   ========================================================= */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = createClient();

  const { data: categoria } = await supabase
    .from("categorias")
    .select("nome")
    .eq("slug", params.slug)
    .single();

  if (!categoria) {
    return {
      title: "Categoria não encontrada | Lasy",
      description: "Categoria de receitas não encontrada.",
    };
  }

  return {
    title: `Receitas ${categoria.nome} | Lasy`,
    description: `Confira as melhores receitas da categoria ${categoria.nome}. Pratos organizados, fáceis de preparar e selecionados para você.`,
  };
}

/* =========================================================
   PÁGINA DA CATEGORIA
   ========================================================= */
export default async function CategoriaPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: categoria, error } = await supabase
    .from("categorias")
    .select(`
      id,
      nome,
      receitas (
        id,
        nome,
        slug,
        imagem_url
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (error || !categoria) {
    return <p className="p-6">Categoria não encontrada.</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{categoria.nome}</h1>

      {categoria.receitas.length === 0 ? (
        <p className="text-gray-600">
          Nenhuma receita cadastrada nesta categoria.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categoria.receitas.map((r) => (
            <li
              key={r.id}
              className="border rounded-xl p-3 hover:shadow-lg transition"
            >
              <Link href={`/receita/${r.slug}`}>
                {r.imagem_url && (
                  <img
                    src={r.imagem_url}
                    alt={r.nome}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <h2 className="font-semibold text-lg">{r.nome}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
