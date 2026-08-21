import Link from "next/link";

interface ReceitaIngredientes {
  id: string;
  nome: string;
  imagem?: string;
}

interface ReceitaPorIngredientes {
  receita: ReceitaIngredientes;
  pontos: number;
  encontrados: string[];
}

interface PainelIngredientesProps {
  buscaIngredientes: string;
  setBuscaIngredientes: (valor: string) => void;
  receitasPorIngredientes: ReceitaPorIngredientes[];
}

export default function PainelIngredientes({
  buscaIngredientes,
  setBuscaIngredientes,
  receitasPorIngredientes,
}: PainelIngredientesProps) {
  return (
    <>
      <div className="mt-4 mb-2">
        <h3 className="block mb-2 font-semibold text-white">
          🥕 Buscar ingredientes
        </h3>
      </div>

      <input
        type="text"
        placeholder="Quais ingredientes você tem? Ex.: frango, arroz, cenoura..."
        value={buscaIngredientes}
        onChange={(e) => setBuscaIngredientes(e.target.value)}
        className="w-full p-3 border rounded bg-white text-black"
      />

      {buscaIngredientes.trim() && (
        <div className="mt-3 text-white">
          <p className="text-sm text-zinc-300 mb-2">
            {receitasPorIngredientes.length > 0
              ? `Encontramos ${receitasPorIngredientes.length} receita(s) similares pelos ingredientes.`
              : "Nenhuma receita encontrada com esses ingredientes."}
          </p>

          <div className="space-y-2">
            {receitasPorIngredientes.map(({ receita, pontos, encontrados }) => (
              <div
                key={receita.id}
                className="flex gap-3 border border-zinc-700 rounded p-3 bg-zinc-900"
              >
                {receita.imagem ? (
                  <img
                    src={receita.imagem}
                    alt={receita.nome}
                    className="w-24 h-20 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-20 rounded-md bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                    🍽️
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-semibold text-white">{receita.nome}</p>

                  <p className="text-sm text-zinc-300">
                    Compatibilidade: {pontos} ingrediente(s)
                  </p>

                  <p className="text-xs text-zinc-400 mb-3">
                    Encontrados: {encontrados.join(", ")}
                  </p>

                  <Link
                    href={`/receita/${receita.id}`}
                    className="inline-block px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500"
                  >
                    VER
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}