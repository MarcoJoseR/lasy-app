interface PainelOrdenacaoProps {
  ordenacao: string;
  setOrdenacao: (valor: string) => void;
}

export default function PainelOrdenacao({
  ordenacao,
  setOrdenacao,
}: PainelOrdenacaoProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm text-gray-300 mb-1">
        Ordenar por
      </label>

      <select
        value={ordenacao}
        onChange={(e) => setOrdenacao(e.target.value)}
        className="w-full p-3 border rounded-lg bg-white text-black"
      >
        <option value="recentes">📅 Mais recentes</option>
        <option value="atualizadas">✏️ Atualizadas recentemente</option>
        <option value="nome-az">🔤 Nome (A-Z)</option>
        <option value="nome-za">🔤 Nome (Z-A)</option>
      </select>
    </div>
  );
}