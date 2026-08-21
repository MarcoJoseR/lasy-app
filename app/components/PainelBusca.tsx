import TituloPainel from "@/app/components/TituloPainel";
import BarraBusca from "./BarraBusca";

interface PainelBuscaProps {
  busca: string;
  setBusca: (valor: string) => void;
  total: number;
}

export default function PainelBusca({
  busca,
  setBusca,
  total,
}: PainelBuscaProps) {
  return (
    <>
      <TituloPainel
        emoji="🧭"
        titulo="Localizar receitas"
      />

      <BarraBusca
        busca={busca}
        setBusca={setBusca}
        total={total}
      />
    </>
  );
}