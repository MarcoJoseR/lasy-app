"use client";

import { useParams, useRouter } from "next/navigation";
import { receitas } from "../../data/receitas";

export default function ReceitaPage() {
  const params = useParams();
  const router = useRouter();

  const receita = receitas.find(
    (r) => r.id === Number(params.id)
  );

  if (!receita) {
    return <div className="p-6 text-white">Receita não encontrada</div>;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto text-white">
      
      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm hover:underline"
      >
        ← Voltar
      </button>

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold mb-2">
        {receita.nome}
      </h1>

      {/* CATEGORIA */}
      <p className="text-zinc-400 mb-6">
        Categoria: {receita.categoria}
      </p>

      {/* IMAGEM */}
      <img
        src={receita.imagem || "/images/receitas/sem-imagem.jpg"}
        className="w-full h-64 object-cover rounded-xl mb-6"
      />

      {/* TEXTO PADRÃO */}
      <p className="text-zinc-300">
        Receita deliciosa que você pode preparar em casa.
        Em breve vamos adicionar ingredientes e modo de preparo.
      </p>

    </main>
  );
}