import BotaoPrimario from "@/app/components/BotaoPrimario";

interface BlocoPreparacaoReceitaProps {
  onLimparPreparacao: () => void;
}

export default function BlocoPreparacaoReceita({
  onLimparPreparacao,
}: BlocoPreparacaoReceitaProps) {
  return (
    <div className="bg-zinc-900 border border-yellow-400 rounded-xl p-4 mb-4">
      <h2 className="text-lg font-semibold text-yellow-400 mb-2">
        📝 Preparar Receita
      </h2>

      <div className="mt-2 mb-4 text-sm text-zinc-300 leading-relaxed">
        <p>1️⃣ Informe os dados da receita.</p>
        <p>2️⃣ Revise as informações.</p>
        <p>3️⃣ Adicione à Minha Biblioteca.</p>
      </div>

      <div className="mb-4">
        <BotaoPrimario
          type="button"
          onClick={onLimparPreparacao}
        >
          🧹 Limpar Preparação
        </BotaoPrimario>
      </div>
    </div>
  );
}