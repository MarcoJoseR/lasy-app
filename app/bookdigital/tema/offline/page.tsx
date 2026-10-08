
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConteudoTemaOffline() {
  const params = useSearchParams();
  const temaId = params.get("id");

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-2xl font-bold">
        Teste de identificação do Tema
      </h1>

      <p className="mt-4 text-zinc-400">
        Identificador recebido:
      </p>

      <p className="mt-2 break-all text-green-400">
        {temaId || "Nenhum identificador informado"}
      </p>
    </main>
  );
}

export default function TemaOfflinePage() {
  return (
    <Suspense fallback={<p>Carregando tema...</p>}>
      <ConteudoTemaOffline />
    </Suspense>
  );
}
