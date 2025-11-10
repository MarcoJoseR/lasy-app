import Link from "next/link";
import Image from "next/image";

export default function CardReceita({ receita, onToggleFav }) {
  return (
    <article className="card">
      <Link href={`/receita/${receita.id}`} className="card-link" aria-label={receita.nome}>
        {/* imagem com fallback handled na seção 2 */}
        <div className="card-thumb">
          <Image
            src={receita.imagem || "/images/receitas/sem-imagem.jpg"}
            alt={receita.nome}
            width={400}
            height={250}
            style={{ objectFit: "cover" }}
            onError={(e) => { /* fallback se necessário — ver seção 2 */ }}
          />
        </div>
        <h3 className="card-title">{receita.nome}</h3>
      </Link>

      <div className="card-meta">
        <span>{receita.categoria}</span>
        <span>{receita.tempo ? formatTempo(receita.tempo) : "—"}</span>
        <button onClick={(e) => { e.stopPropagation(); onToggleFav(receita.id); }}>
          {receita.favorito ? "Favorito" : "Favoritar"}
        </button>
      </div>
    </article>
  );
}

