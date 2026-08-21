"use client";

import { useRouter } from "next/navigation";

type BotaoVoltarProps = {
  texto?: string;
};

export default function BotaoVoltar({
  texto = "← Voltar",
}: BotaoVoltarProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 rounded bg-zinc-800 px-3 py-2 text-white hover:bg-zinc-700"
    >
      {texto}
    </button>
  );
}