import React from "react";
import { createClient } from "@supabase/supabase-js";

// Inicializa Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Receita {
  id: number;
  nome: string;
  ingredientes: string[];
  categoria: string | null;
  tempo: string | null;
  imagem_url: string | null;
}

const ReceitasPage = async () => {
  // Busca receitas normalizadas
  const { data, error } = await supabase.from<Receita>("receitas").select("*");

  if (error) {
    console.error("Erro ao buscar receitas:", error);
    return <div>Erro ao carregar receitas.</div>;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Receitas Normalizadas</h1>
      {data && data.length > 0 ? (
        <div style={{ display: "grid", gap: "2rem" }}>
          {data.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                maxWidth: "500px",
              }}
            >
              <h2>{r.nome}</h2>
              {r.imagem_url && (
                <img
                  src={r.imagem_url}
                  alt={r.nome}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              )}
              <p>
                <strong>Categoria:</strong> {r.categoria || "Não definida"}
              </p>
              <p>
                <strong>Tempo:</strong> {r.tempo || "Não definido"}
              </p>
              <p>
                <strong>Ingredientes:</strong>
              </p>
              <ul>
                {r.ingredientes.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div>Nenhuma receita encontrada.</div>
      )}
    </div>
  );
};

export default ReceitasPage;
