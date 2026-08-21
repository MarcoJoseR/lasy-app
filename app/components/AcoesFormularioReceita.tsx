import BotaoPrimario from "@/app/components/BotaoPrimario";
import BotaoSecundario from "@/app/components/BotaoSecundario";

interface AcoesFormularioReceitaProps {
  editando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function AcoesFormularioReceita({
  editando,
  onConfirmar,
  onCancelar,
}: AcoesFormularioReceitaProps) {
  return (
    <>
      <BotaoPrimario onClick={onConfirmar}>
        {editando ? "Salvar Alteração" : "Adicionar Receita"}
      </BotaoPrimario>

      {editando && (
        <BotaoSecundario onClick={onCancelar}>
          ❌ Cancelar edição
        </BotaoSecundario>
      )}
    </>
  );
}