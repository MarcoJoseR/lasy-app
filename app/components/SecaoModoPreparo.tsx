interface SecaoModoPreparoProps {
  modoPreparo: string;
  setModoPreparo: React.Dispatch<React.SetStateAction<string>>;
}

export default function SecaoModoPreparo({
  modoPreparo,
  setModoPreparo,
}: SecaoModoPreparoProps) {
  return (
    <div className="mb-3">
      <label className="block mb-2 text-sm font-medium text-zinc-700">
        Modo de preparo
      </label>

      <textarea
        placeholder="Descreva o preparo passo a passo..."
        value={modoPreparo}
        onChange={(e) => {
          setModoPreparo(e.target.value);
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