import Image from "next/image";
import Link from "next/link";

interface CategoriaCardProps {
  id: number;
  nome: string;
  imagem: string;
}

export default function CategoriaCard({ id, nome, imagem }: CategoriaCardProps) {
  return (
    <Link href={`/receitas?categoria=${id}`}>
      <div className="cursor-pointer rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform">
        <Image
          src={`/images/categorias/${imagem}`}
          alt={nome}
          width={300}
          height={200}
          className="object-cover"
        />
        <h3 className="text-center mt-2 font-semibold">{nome}</h3>
      </div>
    </Link>
  );
}
