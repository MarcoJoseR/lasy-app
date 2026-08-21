interface BotaoPrimarioProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export default function BotaoPrimario({
  children,
  type = "button",
  onClick,
  disabled = false,
}: BotaoPrimarioProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}