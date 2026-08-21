interface AvisoEdicaoProps {
  editando: boolean;
}

export default function AvisoEdicao({
  editando,
}: AvisoEdicaoProps) {
  if (!editando) return null;

  return (
    <div className="bg-yellow-500 text-black font-semibold p-2 rounded mb-3 text-center">
      ✏️ Você está editando uma receita
    </div>
  );
}