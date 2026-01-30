"use client";

type Receita = {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
};

type Props = {
  receita: Receita;
  isFavorito: boolean;
  onToggleFavorito: (id: string) => void;
};

export default function ReceitaCard({
  receita,
  isFavorito,
  onToggleFavorito,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col w-[220px] flex-shrink-0">
      
      {/* IMAGEM */}
      <div className="relative w-full h-40 overflow-hidden">
        <img
          src={receita.imagem}
          alt={receita.nome}
          className="w-full h-full object-cover"
        />
      </div>

      {/* TEXTO */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {receita.nome}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">
          {receita.descricao}
        </p>
      </div>

      {/* AÇÕES */}
      <div className="flex justify-between items-center p-3 pt-0 text-sm">
        <button onClick={() => onToggleFavorito(receita.id)}>
          {isFavorito ? "❤️ Favorito" : "🤍 Favoritar"}
        </button>
      </div>
    </div>
  );
}
