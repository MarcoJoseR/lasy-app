"use client";

import { useEffect, useState } from "react";

export default function DataHoraAtual() {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(new Date());

    const intervalo = window.setInterval(() => {
      setAgora(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  if (!agora) {
    return (
      <div className="mb-2 text-center text-sm text-gray-400">
        <div className="leading-tight">&nbsp;</div>
        <div className="mt-0.5 text-base font-semibold leading-tight text-white">
          &nbsp;
        </div>
      </div>
    );
  }

  const data = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const hora = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="mb-2 text-center text-sm text-gray-400">
      <div className="capitalize leading-tight">{data}</div>

      <div className="mt-0.5 text-base font-semibold leading-tight text-white">
        {hora}
      </div>
    </div>
  );
}