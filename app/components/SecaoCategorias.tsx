interface SecaoCategoriasProps {
  categoria: string;
  setCategoria: React.Dispatch<React.SetStateAction<string>>;
  subCategoria: string;
  setSubCategoria: React.Dispatch<React.SetStateAction<string>>;
  erroCategoria: string;
  setErroCategoria: React.Dispatch<React.SetStateAction<string>>;
  categorias: string[];
  inputClassBase: string;
}

export default function SecaoCategorias({
  categoria,
  setCategoria,
  subCategoria,
  setSubCategoria,
  erroCategoria,
  setErroCategoria,
  categorias,
  inputClassBase,
}: SecaoCategoriasProps) {
  return (
    <>
      <div className="mb-3">
        <label className="text-sm font-medium text-zinc-700">
          Categoria
        </label>

        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);

            if (erroCategoria) {
              setErroCategoria("");
            }
          }}
          className="mt-1 w-full rounded-lg border p-3 bg-white text-black"
        >
          <option value="">Selecione uma categoria</option>

          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {erroCategoria && (
          <p className="mt-2 text-base text-rose-800">
            ⚠️ {erroCategoria}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium text-zinc-700">
          Subcategoria
        </label>

        <input
          placeholder="Ex: carioca, bolos, massas, sopas..."
          value={subCategoria}
          onChange={(e) => setSubCategoria(e.target.value)}
          className={inputClassBase}
        />
      </div>
    </>
  );
}