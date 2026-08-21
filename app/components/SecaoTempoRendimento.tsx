interface SecaoTempoRendimentoProps {
  tempo: string;
  porcoes: string;
  inputClass: string;
  setTempo: (valor: string) => void;
  setPorcoes: (valor: string) => void;
}

export default function SecaoTempoRendimento({
  tempo,
  porcoes,
  inputClass,
  setTempo,
  setPorcoes,
}: SecaoTempoRendimentoProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="text-sm text-gray-700">
          Tempo
        </label>

        <input
          placeholder="Ex: 30 min"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm text-gray-700">
          Rendimento
        </label>

        <input
          placeholder="Ex: 4 porções"
          value={porcoes}
          onChange={(e) => setPorcoes(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}