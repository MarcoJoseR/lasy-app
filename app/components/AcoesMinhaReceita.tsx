import BotaoPrimario from "@/app/components/BotaoPrimario";
import BotaoSecundario from "@/app/components/BotaoSecundario";

interface AcoesMinhaReceitaProps {
  onSalvar: () => void;
  onLimpar: () => void;
  editando: boolean;
}

export default function AcoesMinhaReceita({
  onSalvar,
  onLimpar,
  editando,
}: AcoesMinhaReceitaProps) {

  return (
    <div className="mt-6 flex gap-3">
      <BotaoPrimario onClick={onSalvar}>
        💾 Salvar Receita
      </BotaoPrimario>

      {!editando && (
        <BotaoSecundario onClick={onLimpar}>
          🧹 Limpar
        </BotaoSecundario>
      )}
    </div>
  );
}