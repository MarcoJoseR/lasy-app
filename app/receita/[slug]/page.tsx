"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useFavoritos } from "../../context/FavoritosContext";

interface Receita {
  id: number;
  nome: string;
  ingredientes_text: string;
  modo_preparo: string;
  imagem_url: string;
  slug: string;
}

export default function ReceitaDetalhePage() {
  const { slug } = useParams();
  const [receita, setReceita] = useState<Receita | null>(null);
  const { favoritos, setFavoritos } = useFavoritos();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/receitas/${slug}`).then(r => r.json());
      setReceita(res.data);
    };
    fetchData().catch(console.error);
  }, [slug]);

  const toggleFavorito = async () => {
    if (!receita) return;
    const isFav = favoritos.includes(receita.id);
    const method = isFav ? "DELETE" : "POST";

    await fetch("/api/favoritos", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receita_id: receita.id }),
    });

    setFavoritos(prev =>
      isFav ? prev.filter(id => id !== receita.id) : [...prev, receita.id]
    );
  };

  if (!receita) {
    return <div style={{ padding: 20 }}>Carregando receita...</div>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>{receita.nome}</h1>

      <Image
        src={receita.imagem_url}
        alt={receita.nome}
        width={500}
        height={300}
        style={{ objectFit: "cover", borderRadius: 8 }}
      />

      {/* INGREDIENTES */}
      <p style={{ marginTop: 10 }}>
        <strong>Ingredientes:</strong>{" "}
        {receita.ingredientes_text &&
        receita.ingredientes_text !== "NULL" &&
        receita.ingredientes_text.trim() !== ""
          ? receita.ingredientes_text.split(",").join(", ")
          : "Sem ingredientes listados"}
      </p>

      {/* MODO DE PREPARO */}
      <p style={{ marginTop: 10 }}>
        <strong>Modo de preparo:</strong>{" "}
        {receita.modo_preparo &&
        receita.modo_preparo !== "NULL" &&
        receita.modo_preparo.trim() !== ""
          ? receita.modo_preparo
          : "Modo de preparo não informado"}
      </p>

      <button
        onClick={toggleFavorito}
        style={{
          marginTop: 20,
          padding: "8px 16px",
          borderRadius: 6,
          backgroundColor: favoritos.includes(receita.id) ? "#f56565" : "#e2e8f0",
          color: favoritos.includes(receita.id) ? "#fff" : "#000",
          border: "none",
          cursor: "pointer",
        }}
      >
        {favoritos.includes(receita.id) ? "♥ Favorito" : "♡ Favoritar"}
      </button>
    </main>
  );
}
