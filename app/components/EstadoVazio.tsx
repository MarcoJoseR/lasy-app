type EstadoVazioProps = {
  titulo: string;
  mensagem: string;
};

export default function EstadoVazio({
  titulo,
  mensagem,
}: EstadoVazioProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-white">
        {titulo}
      </h2>

      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {mensagem}
      </p>
    </div>
  );
}