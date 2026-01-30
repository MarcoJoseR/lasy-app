"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DebugSalgados() {
  const [categoria, setCategoria] = useState<any>(null);

  useEffect(() => {
    async function fetchSalgados() {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("nome", "salgados")
        .single();

      if (error) console.error("Erro ao buscar salgados:", error);
      else setCategoria(data);
    }

    fetchSalgados();
  }, []);

  if (!categoria) return <p>Buscando categoria "salgados"...</p>;

  return (
    <div style={{ border: "1px solid red", padding: "10px", margin: "10px 0" }}>
      <h3>{categoria.nome}</h3>
      <img src={categoria.imagem_url} alt={categoria.nome} style={{ width: "150px" }} />
      <img src={categoria.imagem_sub_url} alt={`${categoria.nome} sub`} style={{ width: "150px" }} />
      <pre>{JSON.stringify(categoria, null, 2)}</pre>
    </div>
  );
}
