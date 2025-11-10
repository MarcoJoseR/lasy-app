// components/RecipeCard.tsx
import Link from "next/link";

interface ReceitaProps {
  receita: {
    id: number;
    nome: string;
    descricao: string;
    imagem_url?: string;
  };
}

export default function RecipeCard({ receita }: ReceitaProps) {
  return (
    <Link href={`/receita/${receita.id}`}>
      <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
        <img
          src={receita.imagem_url || "/fallback-img.jpg"}
          alt={receita.nome}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{receita.nome}</h3>
          <p className="text-gray-600 text-sm">{receita.descricao}</p>
        </div>
      </div>
    </Link>
  );
}
