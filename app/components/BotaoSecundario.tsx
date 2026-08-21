interface BotaoSecundarioProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export default function BotaoSecundario({
  children,
  type = "button",
  onClick,
  disabled = false,
}: BotaoSecundarioProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-zinc-700 px-4 py-2 font-semibold text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}