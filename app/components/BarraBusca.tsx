type BarraBuscaProps = {
  busca: string;
  setBusca: (valor: string) => void;
  total: number;
};

export default function BarraBusca({
  busca,
  setBusca,
  total,
}: BarraBuscaProps) {
  return (
    <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <label className="mb-2 block text-sm font-semibold text-white">
        🔎 Buscar receita
      </label>

      <input
        placeholder="Digite o nome da receita..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full rounded-lg border border-zinc-600 bg-white px-4 py-3 text-black placeholder-gray-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/40"
      />

      <p className="mt-2 text-sm font-semibold text-yellow-400">
        📚 {total} receitas disponíveis
      </p>
    </div>
  );
}