import Link from "next/link";

export function CardReceita({ receita, busca }: any) {
  return (
    <Link href={`/receita/${receita.id}`}>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:scale-[1.02] transition">

        {/* IMAGEM */}
        <img
          src={receita.imagem || "/images/receitas/sem-imagem.jpg"}
          alt={receita.nome}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/receitas/sem-imagem.jpg";
          }}
        />

        {/* TEXTO */}
        <div className="p-3">
          <p className="text-xs text-zinc-400">
            {receita.categoria}
          </p>

          <h3 className="text-white font-semibold">
            {receita.nome}
          </h3>
        </div>

      </div>
    </Link>
  );
}