import TituloPainel from "@/app/components/TituloPainel";
import BotaoPrimario from "@/app/components/BotaoPrimario";

interface PainelCategoriasProps {
  filtroCategoria: string;
  setFiltroCategoria: (valor: string) => void;
  categorias: string[];
}

export default function PainelCategorias({
  filtroCategoria,
  setFiltroCategoria,
  categorias,
}: PainelCategoriasProps) {
  return (
    <div className="mt-4">
      <label className="block mb-2 font-semibold text-white">
        📂 Buscar por categoria
      </label>

      <select
        value={filtroCategoria}
        onChange={(e) => setFiltroCategoria(e.target.value)}
        className="w-full p-3 border rounded-lg bg-white text-black"
      >
        <option value="">Todas as categorias</option>

        {categorias.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </select>

      {filtroCategoria && (
        <div className="mt-2">
          <BotaoPrimario onClick={() => setFiltroCategoria("")}>
            🔄 Todas as categorias
          </BotaoPrimario>
        </div>
      )}

      {filtroCategoria && (
        <div className="mt-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-900">
          📂 Filtrando por: {filtroCategoria}
        </div>
      )}
    </div>
  );
}