import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TesteBanco() {
  const [tabelas, setTabelas] = useState<string[]>([]);
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Listar tabelas
        const { data: infoData, error: infoError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public");

        if (infoError) console.error("Erro ao listar tabelas:", infoError.message);
        else setTabelas(infoData?.map((t: any) => t.table_name) || []);

        // 2️⃣ Buscar 10 receitas de amostra
        const { data: receitasData, error: receitasError } = await supabase
          .from("receitas")
          .select("*")
          .limit(10);

        if (receitasError) console.error("Erro ao buscar receitas:", receitasError.message);
        else setReceitas(receitasData || []);
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Carregando dados do banco...</p>;

  return (
    <div className="max-w-6xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-4">Teste do Banco Supabase</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Tabelas disponíveis:</h2>
        <ul className="list-disc pl-5">
          {tabelas.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Exemplo de 10 receitas:</h2>
        {receitas.map((r: any) => (
          <div key={r.id} className="mb-4 p-3 border rounded shadow-sm">
            <p><strong>Nome:</strong> {r.nome}</p>
            <p><strong>Categoria:</strong> {r.categoria}</p>
            <p><strong>Tempo:</strong> {r.tempo}</p>
            <p><strong>Imagem URL:</strong> {r.imagem_url}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
