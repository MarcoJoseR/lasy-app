interface Props {
  search: string;
  setSearch: (value: string) => void;
  categoriaFilter: string;
  setCategoriaFilter: (value: string) => void;
  categorias: string[];
}

export default function FiltroBusca({
  search,
  setSearch,
  categoriaFilter,
  setCategoriaFilter,
  categorias,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-4">
      <input
        type="text"
        placeholder="Buscar receita..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <select
        value={categoriaFilter}
        onChange={(e) => setCategoriaFilter(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
