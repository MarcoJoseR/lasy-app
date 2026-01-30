// components/ListaCategorias.tsx
"use client"; // se for um componente client-side

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Categoria {
  id: number;
  nome: string;
  imagem_url: string;
  imagem_sub_url: string;
  ativa?: boolean;
}

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const { data, error } = await supabase
          .from("categorias")       // nome da tabela
          .select("*")
          .eq("ativa", true);       // se você quiser filtrar apenas ativas

        if (error) throw error;

        console.log("Categorias recebidas do Supabase:", data); // debug
        setCategorias(data || []);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategorias();
  }, []);

  if (loading) return <p>Carregando categorias...</p>;

  if (!categorias.length) return <p>Nenhuma categoria encontrada.</p>;

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      {categorias.map((cat) => (
        <div key={cat.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
          <h3>{cat.nome}</h3>
          <img
            src={cat.imagem_url}
            alt={`${cat.nome}`}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
          <img
            src={cat.imagem_sub_url}
            alt={`${cat.nome} - sub`}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}
