import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: receitas } = await supabase
    .from("receitas")
    .select("*")
    .order("id", { ascending: true });

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 p-6">
      <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">
        🍲 Receitas do Dia
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {receitas?.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-lg rounded-2xl p-4 hover:scale-105 transition-transform"
          >
            <Image
              src={`/${item.imagem_url}`}
              alt={item.nome}
              width={400}
              height={250}
              className="rounded-xl object-cover h-48 w-full"
            />
            <h2 className="text-xl font-semibold text-orange-700 mt-3">
              {item.nome}
            </h2>
            <p className="text-gray-600 text-sm mt-2">{item.descricao}</p>
            <p className="text-gray-400 text-xs mt-1">
              Categoria: {item.categoria_id}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
