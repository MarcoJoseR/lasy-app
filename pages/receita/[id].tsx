// pages/receita/[id].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../components/Layout";
import supabase from "../../lib/supabaseClient";

interface ReceitaProps {
  receita: {
    id: number;
    nome: string;
    descricao: string;
    imagem_url?: string;
    ingredientes: string[];
    modo_preparo: string;
  };
}

export default function ReceitaPage({ receita }: ReceitaProps) {
  if (!receita) {
    return (
      <Layout>
        <p className="text-center mt-8 text-gray-600">Receita não encontrada.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <button
          onClick={() => window.history.back()}
          className="mb-4 text-green-600 hover:underline"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-bold mb-4">{receita.nome}</h1>
        <img
          src={receita.imagem_url || "/fallback-img.jpg"}
          alt={receita.nome}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <p className="text-gray-700 mb-4">{receita.descricao}</p>

        <h2 className="text-2xl font-semibold mb-2">Ingredientes</h2>
        <ul className="list-disc pl-6 mb-4">
          {receita.ingredientes.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Modo de Preparo</h2>
        <p className="text-gray-700">{receita.modo_preparo}</p>
      </div>
    </Layout>
  );
}

// Gera caminhos estáticos para todas as receitas
export const getStaticPaths: GetStaticPaths = async () => {
  const { data: receitas } = await supabase.from("receitas").select("id");
  const paths =
    receitas?.map((r) => ({
      params: { id: r.id.toString() },
    })) || [];

  return { paths, fallback: true };
};

// Busca os dados da receita pelo ID
export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;
  const { data, error } = await supabase
    .from("receitas")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    return { props: { receita: null } };
  }

  // Converte ingredientes para array, caso seja string separada por vírgula
  const ingredientes =
    typeof data.ingredientes === "string"
      ? data.ingredientes.split(",").map((i: string) => i.trim())
      : data.ingredientes || [];

  return {
    props: {
      receita: { ...data, ingredientes },
    },
    revalidate: 10, // revalida a cada 10 segundos
  };
};
