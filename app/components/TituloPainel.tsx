interface TituloPainelProps {
  emoji: string;
  titulo: string;
  descricao?: string;
}

export default function TituloPainel({
  emoji,
  titulo,
  descricao,
}: TituloPainelProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-white">
        {emoji} {titulo}
      </h2>

      {descricao && (
        <p className="mt-2 text-sm text-zinc-400">
          {descricao}
        </p>
      )}
    </div>
  );
}