import CardReceita from "./CardReceita";
import EstadoVazio from "./EstadoVazio";
import type { Receita } from "../context/ReceitasContext";

interface Props {
  receitasFiltradas: Receita[];
  totalReceitas: number;
  categorias: string[];
  handleVer?: (r: Receita) => void;
  handleFavorito: (r: Receita) => void;
  handleRemover: (r: Receita) => void;
  iniciarEdicao: (r: Receita) => void;
  editandoId: string | null;
}

export default function ListaReceitas({
  receitasFiltradas,
  totalReceitas,
  categorias,
  handleVer,
  handleFavorito,
  handleRemover,
  iniciarEdicao,
  editandoId,
}: Props) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          🍽️ Receitas disponíveis
        </h2>

        {totalReceitas > 0 && (
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-black">
            {receitasFiltradas.length} de {totalReceitas}
          </span>
        )}
      </div>

      {receitasFiltradas.length === 0 ? (
        <EstadoVazio
          titulo={
            totalReceitas === 0
              ? "Nenhuma receita cadastrada ainda"
              : "Nenhuma receita encontrada"
          }
          mensagem={
            totalReceitas === 0
              ? "Importe ou adicione sua primeira receita para começar."
              : "Tente buscar por outro nome, ingrediente ou categoria."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {receitasFiltradas.map((r) => (
            <CardReceita
              key={r.id}
              receita={r}
              onVer={handleVer}
              categorias={categorias}
              onFavorito={handleFavorito}
              onRemover={handleRemover}
              onEditar={iniciarEdicao}
              editando={editandoId === r.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}