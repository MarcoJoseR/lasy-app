
"use client";

import { Suspense } from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import ItemBiblioteca from "../ItemBiblioteca";

function ConteudoItemOffline() {
  const params = useSearchParams();
  const pathname = usePathname();

  const idPelaUrl = params.get("id") ?? "";

  const idPeloCaminho =
    pathname.match(/^\/bookdigital\/item\/([^/]+)\/?$/)?.[1] ?? "";

  const itemId =
    idPelaUrl || (idPeloCaminho === "offline" ? "" : idPeloCaminho);

  if (!itemId) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-zinc-400">
          Nenhum Item foi identificado.
        </p>
      </main>
    );
  }

  return <ItemBiblioteca itemId={itemId} />;
}

export default function ItemOfflinePage() {
  return (
    <Suspense fallback={<p>Carregando item...</p>}>
      <ConteudoItemOffline />
    </Suspense>
  );
}
