type BotaoAcaoProps = {
  children: React.ReactNode;
  onClick?: () => void;
  tipo?: "primario" | "sucesso" | "perigo" | "neutro" | "favorito";
  title?: string;
};

export default function BotaoAcao({
  children,
  onClick,
  tipo = "neutro",
  title,
}: BotaoAcaoProps) {
  const estilos = {
    primario: "bg-blue-600 hover:bg-blue-700",
    sucesso: "bg-green-600 hover:bg-green-700",
    perigo: "bg-red-600 hover:bg-red-700",
    neutro: "bg-zinc-800 hover:bg-zinc-700",
    favorito: "bg-yellow-500 hover:bg-yellow-600 text-black",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${estilos[tipo]} rounded px-3 py-1 text-sm font-medium text-white transition hover:scale-105`}
    >
      {children}
    </button>
  );
}