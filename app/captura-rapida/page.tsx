
"use client";

import { useState } from "react";
import Link from "next/link";
import { salvarLinkPendente } from "@/app/lib/links-pendentes";

export default function CapturaRapidaPage() {
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function guardarLink() {
    setMensagem("");
    setErro("");

    const linkLimpo = url.trim();

    if (!linkLimpo) {
      setErro("Cole o link da matéria antes de salvar.");
      return;
    }

    try {
      salvarLinkPendente(linkLimpo, titulo);

      setMensagem("✅ Link guardado com sucesso!");
      setUrl("");
      setTitulo("");
    } catch (error) {
      console.error("Erro ao guardar link:", error);

      setErro(
        "Não foi possível guardar o link. Verifique o endereço e tente novamente."
      );
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-5 text-white">
      <h1 className="mb-2 text-2xl font-bold">
        📌 Captura Rápida
      </h1>

      <p className="mb-6 text-sm text-zinc-400">
        Encontrou algo interessante? Guarde o link agora
        e organize depois.
      </p>

      <div className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <div>
          <label
            htmlFor="linkMateria"
            className="mb-2 block text-sm font-semibold"
          >
            Link da matéria
          </label>

          <input
            id="linkMateria"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Cole o link aqui"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label
            htmlFor="tituloMateria"
            className="mb-2 block text-sm font-semibold"
          >
            Nome do assunto (opcional)
          </label>

          <input
            id="tituloMateria"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Receita, curso, dica profissional..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="button"
          onClick={guardarLink}
          className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          📌 Guardar link
        </button>

        {mensagem && (
          <p role="status" className="text-sm text-green-400">
            {mensagem}
          </p>
        )}

        {erro && (
          <p role="alert" className="text-sm text-red-400">
            {erro}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/links-pendentes"
          className="rounded-lg bg-zinc-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700"
        >
          Ver links pendentes
        </Link>

        <Link
          href="/inicio"
          className="rounded-lg border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
        >
          Voltar ao Início
        </Link>
      </div>
    </main>
  );
}
