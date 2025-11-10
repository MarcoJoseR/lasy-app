import React, { useRef, useEffect } from "react";
import { useReceitas } from "../../context/ReceitasContext";
import Link from "next/link";
import Image from "next/image";

export default function ListaReceitas() {
  const { receitas, loadMore, hasMore, isLoading, saveScrollPos } = useReceitas();
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  if (!receitas.length && !isLoading) {
    return <p className="text-center text-gray-500 mt-10">Nenhuma receita encontrada.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-6">
        {receitas.map(r => (
          <li key={r.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden">
            <Link href={`/receita/${r.id}`} onClick={() => saveScrollPos(window.scrollY)}>
              <div className="relative w-full h-40">
                <Image
                  src={r.imagem_url && r.imagem_url.trim() !== "" ? r.imagem_url : "/images/fallback-img.jpg"}
                  alt={r.nome || "Receita sem título"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-lg font-semibold text-gray-800">{r.nome || "Receita sem título"}</h3>
                {r.categoria && <p className="text-sm text-gray-500 mt-1">{r.categoria}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {isLoading && <p className="text-center text-blue-500 mt-4">Carregando...</p>}
      {!hasMore && receitas.length > 0 && !isLoading && (
        <p className="text-center text-gray-400 mt-6 mb-8">Não há mais receitas.</p>
      )}

      <div ref={observerRef} className="h-20"></div>
    </div>
  );
}
