"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LinkPendente,
  listarLinksPendentes,
} from "@/app/lib/links-pendentes";

export default function LinksPendentesPage() {
  const [links, setLinks] = useState<LinkPendente[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setLinks(listarLinksPendentes());
    setCarregado(true);
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-5 text-white">
      <h1 className="mb-2 text-2xl font-bold">
        📌 Links Pendentes
      </h1>

      <p className="mb-6 text-sm text-zinc-400">
        Suas matérias guardadas para organizar depois.
      </p>

      {!carregado ? (
        <p className="text-zinc-400">
          Carregando links...
        </p>
      ) : links.length === 0 ? (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
          <p className="text-zinc-300">
            Nenhum link pendente no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-zinc-700 bg-zinc-900 p-4"
            >
              <h2 className="mb-2 break-words font-semibold">
                {link.titulo || "Link guardado"}
              </h2>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sm text-green-400 underline"
              >
                {link.url}
              </a>

              <p className="mt-3 text-xs text-zinc-400">
                Guardado em:{" "}
                {new Date(link.criadoEm).toLocaleString("pt-BR")}
              </p>

              <p className="mt-1 text-xs text-amber-400">
                Pendente de organização
              </p>
            </div>
          ))}
        </div>
      )}
    
      <div className="mt-6">
        <Link
          href="/inicio"
          className="inline-block rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
        >
          ← Voltar ao Início
        </Link>
      </div>
    
    </main>
  );
}
