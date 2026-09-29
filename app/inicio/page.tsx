"use client";

import { useState } from "react";
import Link from "next/link";

import {
  exportarBackupApp,
} from "@/app/utils/exportarBackupApp";

import {
  validarBackupApp,
  restaurarBackupApp,
} from "@/app/utils/importarBackupApp";

export default function InicioPage() {
  const [exportandoBackup, setExportandoBackup] =
  useState(false);
  
const [importandoBackup, setImportandoBackup] =
  useState(false);

async function handleExportarBackupGeral() {
  try {
    setExportandoBackup(true);

    const resultado =
      await exportarBackupApp();

    if (!resultado.sucesso) {
      alert(
        "Não foi possível gerar o backup geral."
      );

      return;
    }

    alert(
      `Backup geral exportado com sucesso.\n\n` +
        `HEALTH\n` +
        `${resultado.health?.receitas ?? 0} receitas\n` +
        `${resultado.health?.listas ?? 0} listas\n` +
        `${resultado.health?.carrosseis ?? 0} carrosséis\n` +
        `${resultado.health?.prints ?? 0} conjuntos de prints\n` +
        `${resultado.health?.capas ?? 0} capas\n\n` +
        `BOOKDIGITAL\n` +
        `${resultado.bookdigital?.temas ?? 0} temas\n` +
        `${resultado.bookdigital?.itens ?? 0} itens\n` +
        `${resultado.bookdigital?.capas ?? 0} capas\n` +
        `${resultado.bookdigital?.imagens ?? 0} conjuntos de imagens\n` +
        `${resultado.bookdigital?.documentos ?? 0} documentos`
    );
  } finally {
    setExportandoBackup(false);
  }
}

async function handleImportarBackupGeral(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const arquivo = event.target.files?.[0];

  if (!arquivo) {
    return;
  }

  try {
    setImportandoBackup(true);

    const resultado =
      await validarBackupApp(arquivo);

    if (!resultado.valido) {
      alert(resultado.mensagem);
      event.target.value = "";
      return;
    }

    const confirmar = window.confirm(
      `Backup geral válido.\n\n` +
        `HEALTH\n` +
        `${resultado.health.receitas} receitas\n` +
        `${resultado.health.listas} listas\n` +
        `${resultado.health.carrosseis} carrosséis\n` +
        `${resultado.health.prints} conjuntos de prints\n` +
        `${resultado.health.capas} capas\n\n` +
        `BOOKDIGITAL\n` +
        `${resultado.bookdigital.temas} temas\n` +
        `${resultado.bookdigital.itens} itens\n` +
        `${resultado.bookdigital.capas} capas\n` +
        `${resultado.bookdigital.imagens} conjuntos de imagens\n` +
        `${resultado.bookdigital.documentos} documentos\n\n` +
        `ATENÇÃO:\n` +
        `Os dados pessoais atuais serão substituídos pelos dados deste backup.\n\n` +
        `Deseja continuar?`
    );

    if (!confirmar) {
      event.target.value = "";
      return;
    }

    if (!resultado.backup) {
      alert(
        "Não foi possível localizar os dados do backup."
      );

      event.target.value = "";
      return;
    }

    const restauracao =
      await restaurarBackupApp(
        resultado.backup
      );

    if (!restauracao.sucesso) {
      alert(restauracao.mensagem);
      event.target.value = "";
      return;
    }

    alert(
      "Backup geral restaurado com sucesso."
    );

    window.location.reload();
  } finally {
    setImportandoBackup(false);
    event.target.value = "";
  }
}

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        
        {/* APRESENTAÇÃO */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
            Seu espaço pessoal
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Guarde o que importa.
            <br />
            Encontre quando precisar.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Saúde, receitas, documentos, imagens, vídeos e referências
            pessoais organizados em um único ambiente.
          </p>
        </header>

        {/* MÓDULOS */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* HEALTH */}
            <div className="flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
              <div className="flex-1">
                <p className="inline-flex rounded-lg bg-white px-3 py-1 text-base font-bold uppercase tracking-wide text-green-700">
                  Health
                </p>

                <h2 className="mt-4 text-2xl font-bold">
                  Seu espaço para cuidar da sua saúde
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  Receitas, organização alimentar e recursos para o seu
                  dia a dia.
                </p>
              </div>

              <Link
                href="/recepcao"
                className="mt-6 block rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-500"
              >
                Entrar no Health
              </Link>
            </div>

            {/* BOOKDIGITAL */}
            <div className="flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
              <div className="flex-1">
                <p className="inline-flex rounded-lg bg-purple-700 px-3 py-1 text-base font-bold uppercase tracking-wide text-white">
                  BaúDigital
                </p>

                <h2 className="mt-4 text-2xl font-bold">
                  Seu espaço para organizar o que importa
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  Imagens, documentos, vídeos, links e referências
                  pessoais organizadas por temas.
                </p>
              </div>

              <Link
                href="/bookdigital"
                className="mt-6 block rounded-xl bg-purple-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-purple-600"
              >
                Entrar no BaúDigital
              </Link>
            </div>
          </div>
        

        {/* DADOS / BACKUP */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm font-semibold text-zinc-300">
            🛡️ Seus dados
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Exporte um backup completo dos seus conteúdos ou restaure
            seus dados a partir de um backup anterior.
          </p>
        </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleExportarBackupGeral}
              disabled={exportandoBackup}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportandoBackup
                ? "Gerando backup..."
                : "Exportar backup geral"}
            </button>

            <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500">
              {importandoBackup
                ? "Restaurando backup..."
                : "Restaurar backup geral"}

              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportarBackupGeral}
                disabled={importandoBackup}
                className="hidden"
              />
            </label>
          </div>

        {/* RODAPÉ */}
        <p className="mt-10 text-center text-xs text-zinc-600">
          Organize hoje. Encontre quando precisar.
        </p>
      </div>
    </main>
  );
}