interface SecaoIngredientesProps {
  ingredientesTexto: string;
  setIngredientesTexto: React.Dispatch<React.SetStateAction<string>>;
}

export default function SecaoIngredientes({
  ingredientesTexto,
  setIngredientesTexto,
}: SecaoIngredientesProps) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium text-zinc-700">
        Ingredientes
      </label>

      <textarea
        placeholder={"Ex: 2 ovos\n1 xícara de leite\n1 colher de açúcar"}
        value={ingredientesTexto}
        onChange={(e) => {
          setIngredientesTexto(e.target.value);
        }}
        className="
          w-full
          p-3
          border
          rounded
          bg-white
          text-black
          placeholder-gray-700
          leading-7
          resize-y
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-400
        "
        rows={8}
      />
    </div>
  );
}