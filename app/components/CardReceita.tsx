import Link from "next/link";

export default function CardReceita({ receita }: any) {
  return (
    <Link href={`/receita/${receita.id}`}>
      <div className="relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition duration-300">

        {/* IMAGEM */}
        <img
          src={receita.imagem}
          className="w-full h-48 object-cover"
        />

        {/* OVERLAY (gradiente escuro) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

        {/* TEXTO SOBRE IMAGEM */}
        <div className="absolute bottom-0 p-4">
          <h2 className="text-white font-bold text-xl drop-shadow-md">
            {receita.nome}
          </h2>
        </div>

      </div>
    </Link>
  );
}