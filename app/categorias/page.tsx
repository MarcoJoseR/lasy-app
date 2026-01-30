import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BuscaReceitas from "@/components/BuscaReceitas";

export default async function CategoriasPage() {
  const supabase = createClient();

  const { data: categorias } = await supabase
    .from("categorias")
    .select(`
      id,
      nome,
      slug,
      receitas:receitas(id)
    `);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categorias</h1>

      <BuscaReceitas />

      <ul className="grid grid-cols-2 gap-4 mt-6">
        {categorias?.map((cat) => (
          <li key={cat.id} className="border p-4 rounded">
            <Link href={`/categorias/${cat.slug}`}>
              <h2 className="font-semibold">{cat.nome}</h2>
              <p className="text-sm text-gray-500">
                {cat.receitas?.length || 0} receitas
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
