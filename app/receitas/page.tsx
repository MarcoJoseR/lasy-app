// app/receitas/page.tsx
import { createClient } from "@supabase/supabase-js";
import ReceitasClient from "./ReceitasClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ReceitasPage() {
  const { data: receitas, error } = await supabase
    .from("receitas")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Erro ao carregar receitas</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return <ReceitasClient initialReceitas={receitas || []} />;
}
