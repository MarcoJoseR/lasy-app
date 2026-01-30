"use client";

import Link from "next/link";
import Image from "next/image";
import { useMeuDia } from "@/app/context/MeuDiaContext";

interface Receita {
  id: number;
  nome: string;
  imagem?: string;
  categoria?: string;
  tempo?: number;
}

export default function CardReceita({
  receita,
  onToggleFav,
}: {
  receita: Receita;
  onToggleFav?: (id: number) => void;
}) {
  const { adicionarRefeicao } = useMeuDia();

  // Caminho da imagem
  const categoriaPath = receita.categoria
    ? receita.categoria.toLowerCase().replace(/\s+/g, "-")
    : "geral";

  const imagemSrc = receita.imagem_url && receita.imagem_url.trim() !== ""
  ? receita.imagem_url.startsWith("/")
    ? receita.imagem_url
    : `/${receita.imagem_url}`
  : `/images/receitas/${categoriaPath}/sem-imagem.jpg`;

  const formatTempo = (minutos?: number) =>
    minutos ? `${minutos} min` : "—";

  return (
    <article className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
      <Link href={`/receita/${receita.id}`} className="block">
        {/* IMAGEM + TÍTULO */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden">
          <Image
            src={imagemSrc}
            alt={receita.nome}
            fill
            className="object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2">
            <h3 className="text-white text-sm font-semibold leading-tight">
              {receita.nome}
            </h3>
          </div>
        </div>
      </Link>

      {/* META + AÇÕES */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>{receita.categoria}</span>
        <span>{formatTempo(receita.tempo)}</span>
      </div>

      {/* BOTÃO MEU DIA */}
      <button
        onClick={() =>
          adicionarRefeicao("almoco", {
            id: receita.id,
            nome: receita.nome,
            imagem: receita.imagem ?? "",
          })
        }
        className="mt-2 w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-medium hover:bg-emerald-700 transition"
      >
        Adicionar ao Meu Dia
      </button>
    </article>
  );
}
