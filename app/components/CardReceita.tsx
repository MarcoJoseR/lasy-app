"use client";

import { useEffect, useState } from "react";
import BotaoLink from "@/app/components/BotaoLink";
import { obterCapaReceita } from "@/app/utils/carrosselIndexedDB";
import type { Receita } from "../context/ReceitasContext";

interface CardProps {
  receita: Receita;
  categorias?: string[];
  onEditar?: (r: Receita) => void;
  onRemover?: (r: Receita) => void;
  onFavorito?: (r: Receita) => void;
  editando?: boolean;
  onVer?: (r: Receita) => void;
}

export default function CardReceita({
  receita,
  onVer,
  onFavorito,
  onRemover,
  onEditar,
  editando,
}: CardProps) {
  
  const [imagemReceita, setImagemReceita] = useState(
  receita.imagem || "/images/categorias/sem-imagem.jpg"
);

useEffect(() => {
  let ativo = true;

  async function carregarCapa() {
    console.log(
      "CARD CAPA:",
      receita.nome,
      {
        imagem: receita.imagem,
        chaveImagemCapa: receita.chaveImagemCapa,
      }
    );
    
    if (receita.imagem) {
      setImagemReceita(receita.imagem);
      return;
    }

    if (receita.chaveImagemCapa) {
      try {
        const capa = await obterCapaReceita(
          receita.chaveImagemCapa
        );

        console.log(
          "CAPA CARREGADA:",
          receita.nome,
          typeof capa,
          capa?.length
        );

        if (ativo && capa) {
          setImagemReceita(capa);
          return;
        }
      } catch (error) {
        console.error(
          "Erro ao carregar capa da receita:",
          error
        );
      }
    }

    if (ativo) {
      setImagemReceita(
        "/images/categorias/sem-imagem.jpg"
      );
    }
  }

  carregarCapa();

  return () => {
    ativo = false;
  };
}, [
  receita.imagem,
  receita.chaveImagemCapa,
]);
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-zinc-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* IMAGEM */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={imagemReceita}
          alt={receita.nome}
          style={{
            objectPosition: `center ${receita.posicaoImagemY ?? 50}%`,
          }}
          onError={(e) => {
            e.currentTarget.src = "/images/categorias/sem-imagem.jpg";
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* TIPO DE CONTEÚDO / CATEGORIA */}
        <div className="absolute top-3 left-3">
          <span className="rounded-md bg-black/80 px-3 py-1 text-sm font-semibold text-white">
            {receita.tipoConteudo === "carrossel"
              ? "📚 Carrossel"
              : receita.categoria}
          </span>
        </div>
        
      {/* EDITANDO */}
        {editando && (
          <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black shadow">
            Editando
          </div>
        )}

{/* FAVORITO */}
<button
  type="button"
  onClick={() => onFavorito?.(receita)}
  aria-pressed={receita.favorito}
  className={`rounded-md border-2 px-3 py-2 text-sm font-bold transition hover:scale-105 ${
    receita.favorito
      ? "border-green-300 bg-green-600 text-white"
      : "border-zinc-500 bg-zinc-800 text-zinc-200 hover:border-yellow-400 hover:text-yellow-400"
  }`}
  title={String(receita.favorito)}
>
  {receita.favorito ? "✓ Favorita" : "☆Favoritar"}
</button>

        {/* TEXTO SOBRE A IMAGEM */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          
          <h2 className="line-clamp-2 text-lg font-bold leading-tight text-white drop-shadow">
            {receita.nome.replace(/^Nome:\s*/i, "")}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-100">
            {receita.tempo && (
              <span className="rounded-full bg-black/50 px-3 py-1 backdrop-blur">
                ⏱ {receita.tempo}
              </span>
            )}

            {receita.porcoes && (
              <span className="rounded-full bg-black/50 px-3 py-1 backdrop-blur">
                🍽️ {receita.porcoes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex items-center justify-between gap-2 border-t border-zinc-800 bg-zinc-950 p-3">
        <BotaoLink
          href={`/receita/${receita.id}`}
          title="Ver receita"
          onClick={() => onVer?.(receita)}
        >
          👁️ Ver
        </BotaoLink>
      
        <div className="flex gap-2">
          <button
            onClick={() => onEditar?.(receita)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white transition hover:bg-zinc-700"
            title="Editar receita"
          >
            ✏️
          </button>

          <button
            onClick={() => onRemover?.(receita)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white transition hover:bg-red-700"
            title="Remover receita"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}