"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  LinkPendente,
  listarLinksPendentes,
  excluirLinkPendente,
} from "@/app/lib/links-pendentes";

import { listarTemas } from "@/app/lib/bookdigital-temas";

export default function LinksPendentesPage() {
  const router = useRouter();
  
  const [links, setLinks] = useState<LinkPendente[]>([]);
  const [carregado, setCarregado] = useState(false);

  const [temas, setTemas] = useState<
    { id: string; nome: string }[]
  >([]);

  const [linkSelecionadoId, setLinkSelecionadoId] =
    useState<string | null>(null);

function guardarNoHealth(link: LinkPendente) {
  const parametros = new URLSearchParams({
    title: link.titulo,
    url: link.url,
  });

  router.push(
    `/importar-receita?${parametros.toString()}`
  );
}

function retirarDaLista(id: string) {
  const confirmar = window.confirm(
    "Deseja retirar este link da lista de pendências?"
  );

  if (!confirmar) return;

  excluirLinkPendente(id);

  setLinks(listarLinksPendentes());
}

  useEffect(() => {
    setLinks(listarLinksPendentes());
    setTemas(listarTemas());
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

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => guardarNoHealth(link)}
                  className="rounded-lg border border-green-700 bg-green-900/30 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-900/50"
                >
                  Guardar no Health
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLinkSelecionadoId(
                      linkSelecionadoId === link.id ? null : link.id
                    )
                  }
                  className="rounded-lg border border-purple-700 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-900/30"
                >
                  Guardar no BaúDigital
                </button>

        {linkSelecionadoId === link.id && (
          <div className="w-full rounded-lg border border-purple-800 bg-zinc-950 p-3">
            <p className="mb-2 text-sm font-semibold text-purple-300">
              Escolha o Tema de destino:
            </p>

            {temas.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhum Tema cadastrado no BaúDigital.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {temas.map((tema) => (
                  <button
                    key={tema.id}
                    type="button"
                    onClick={() => {
                      const parametros = new URLSearchParams({
                        id: tema.id,
                        titulo: link.titulo,
                        link: link.url,
                      });

                      window.location.assign(
                        `/bookdigital/tema/offline?${parametros.toString()}`
                      );
                    }}
                    className="rounded-lg border border-purple-700 px-3 py-2 text-sm font-medium text-white hover:bg-purple-900/30"
                  >
                    {tema.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
                <button
                  type="button"
                  onClick={() => retirarDaLista(link.id)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Retirar da lista
                </button>
              </div>
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
