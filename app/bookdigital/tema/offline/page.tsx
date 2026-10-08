"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TemaBiblioteca from "../TemaBiblioteca";

function ConteudoTemaOffline() {
  const params = useSearchParams();
  const temaId = params.get("id") ?? "";

  if (!temaId) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-zinc-400">
          Nenhum Tema foi identificado.
        </p>
      </main>
    );
  }

  return <TemaBiblioteca temaId={temaId} />;
}

export default function TemaOfflinePage() {
  return (
    <Suspense fallback={<p>Carregando tema...</p>}>
      <ConteudoTemaOffline />
    </Suspense>
  );
}