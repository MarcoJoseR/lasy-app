import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Receita {
  id: number;
  nome: string;
  descricao: string;
  imagem_url: string;
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    async function fetchReceitas() {
      try {
        const res = await fetch("/api/receitas");
        if (!res.ok) throw new Error("Falha ao carregar receitas");
        const data = await res.json();
        setReceitas(data);
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
      }
    }
    fetchReceitas();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Receitas Deliciosas
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {receitas.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            Nenhuma receita encontrada.
          </p>
        ) : (
          receitas.map((receita) => {
            // Caminho seguro da imagem
            const imgName = receita.imagem_url?.trim() || "default.jpg";

            // Se for URL externa, mantém como está
            const imgPath = imgName.startsWith("http")
              ? imgName
              : `/images/receitas/${imgName}`; // já inclui subpastas

            return (
              <Link
                key={receita.id}
                href={`/receita/${receita.id}`}
                className="block rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={imgPath}
                    alt={receita.nome}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-white">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">
                    {receita.nome}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {receita.descricao}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
