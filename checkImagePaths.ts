// C:\supabase-app\app\receita\[slug]\page.tsx
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

// ============================
// TIPAGEM DA RECEITA
// ============================
interface Receita {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  ingredientes: string[];
  modo_preparo: string[];
  imagem: string | null;
  categoria: string | null;
}

// ============================
// FUNÇÃO ROBUSTA PARA RESOLVER CAMINHOS DE IMAGEM
// ============================
function resolveImagePath(imagem: string | null, categoria: string | null): string | null {
  if (!imagem || !categoria) return null;

  const map: Record<string, string> = {
    "gin-com-cereja": "gin-cereja",
    "torta-de-morango": "torta-morango",
    // Adicione outras divergências aqui
  };

  const key = imagem.toLowerCase();
  const fileName = map[key] || key;

  // Garanta apenas uma barra inicial
  return `/images/receitas/${categoria}/${fileName}.jpg`;
}

// ============================
// BUSCA RECEITA POR SLUG
// ============================
async function getReceitaBySlug(slug: string): Promise<Receita | null> {
  const { data, error } = await supabase
    .from("receitas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Erro ao buscar receita:", error);
    return null;
  }

  return data as Receita;
}

// ============================
// BUSCA SIMILARES VIA EMBEDDINGS
// ============================
async function getSimilarRecipesEmbedding(
  textoBase: string,
  idReceita: number,
  { match_threshold = 0.6, match_count = 6 } = {}
) {
  const { data, error } = await supabase.rpc("match_recipes", {
    query_text: textoBase,
    recipe_id: idReceita,
    match_threshold,
    match_count,
  });

  if (error) {
    console.error("Erro ao buscar similares:", error);
    return [];
  }

  return data || [];
}

// ============================
// METADATA DINÂMICA
// ============================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const receita = await getReceitaBySlug(slug);

  if (!receita) {
    return { title: "Receita não encontrada" };
  }

  return {
    title: receita.nome,
    description: receita.descricao,
  };
}

// ============================
// PÁGINA PRINCIPAL
// ============================
export default async function ReceitaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const receita = await getReceitaBySlug(slug);

  if (!receita) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Receita não encontrada</h1>
      </div>
    );
  }

  const similares = await getSimilarRecipesEmbedding(
    receita.descricao,
    receita.id,
    { match_threshold: 0.6, match_count: 6 }
  );

  // ============================
  // RESOLUÇÃO ROBUSTA DO CAMINHO DA IMAGEM
  // ============================
  const imagePath = resolveImagePath(receita.imagem, receita.categoria);

  // ============================
  // JSON COMPLETO PARA DEBUG
  // ============================
  const receitaJSON = JSON.stringify(
    { receita, similares, imagePath },
    null,
    2
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Título */}
      <h1 className="text-4xl font-bold mb-4">{receita.nome}</h1>

      {/* Imagem */}
      {imagePath ? (
        <Image
          src={imagePath} // /images/receitas/categoria/nome.jpg
          alt={receita.nome}
          width={900}
          height={600}
          className="rounded-xl mb-6"
        />
      ) : (
        <p className="text-gray-500 mb-6">Imagem não disponível</p>
      )}

      {/* Descrição */}
      <p className="text-lg text-gray-700 mb-6">{receita.descricao}</p>

      {/* Ingredientes */}
      <h2 className="text-2xl font-semibold mb-2">Ingredientes</h2>
      <ul className="list-disc pl-6 mb-6">
        {receita.ingredientes.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {/* Modo de preparo */}
      <h2 className="text-2xl font-semibold mb-2">Modo de preparo</h2>
      <ol className="list-decimal pl-6 mb-6
