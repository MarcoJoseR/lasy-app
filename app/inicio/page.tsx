"use client";

import { useState } from "react";
import Link from "next/link";

import {
  exportarBackupApp,
} from "@/app/utils/exportarBackupApp";

import {
  validarBackupApp,
  restaurarBackupApp,
  verificarRestauracaoPendente,
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


    const pendencias = resultado.pendencias ?? [];

    const mensagemPendencias =
      pendencias.length > 0
        ? "\n\nPENDÊNCIAS DO BACKUP\n" +
          pendencias
            .map(
              (pendencia, indice) =>
                `${indice + 1}. ${pendencia.modulo} - ${pendencia.nome}\n` +
                `   Problema: ${pendencia.problema}`
            )
            .join("\n\n") +
          "\n\nOs conteúdos acima não foram incluídos no backup. " +
          "Eles permanecem no aplicativo para correção ou substituição."
        : "";

    const titulo =
      pendencias.length > 0
        ? "Backup exportado com pendências.\n\n"
        : "Backup geral exportado com sucesso.\n\n";

    alert(
      titulo +
        `HEALTH\n` +
        `${resultado.health?.receitas ?? 0} receitas\n` +
        `${resultado.health?.listas ?? 0} listas\n` +
        `${resultado.health?.carrosseis ?? 0} carrosséis\n` +
        `${resultado.health?.prints ?? 0} conjuntos de prints\n` +
        `${resultado.health?.capas ?? 0} capas\n\n` +
        `BAÚDIGITAL\n` +
        `${resultado.bookdigital?.temas ?? 0} temas\n` +
        `${resultado.bookdigital?.itens ?? 0} itens\n` +
        `${resultado.bookdigital?.capas ?? 0} capas\n` +
        `${resultado.bookdigital?.imagens ?? 0} conjuntos de imagens\n` +
        `${resultado.bookdigital?.documentos ?? 0} documentos\n\n` +
        `LINKS PENDENTES\n` +
        `${resultado.linksPendentes ?? 0} links guardados` +
        mensagemPendencias
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

  const recuperacaoPendente =
    verificarRestauracaoPendente();

  if (recuperacaoPendente) {
    const confirmarRecuperacao = window.confirm(
      "RECUPERAÇÃO DE RESTAURAÇÃO INTERROMPIDA\n\n" +
      "Foi identificada uma restauração anterior " +
      "que não terminou corretamente.\n\n" +
      "Os dados atuais podem estar parcialmente restaurados.\n\n" +
      "Para recuperar, é necessário utilizar o arquivo " +
      "de segurança salvo ANTES da restauração interrompida.\n\n" +
      "O arquivo já selecionado é essa cópia de segurança?\n\n" +
      "OK: continuar a validação para recuperação.\n" +
      "Cancelar: não modificar nenhum dado."
    );

    if (!confirmarRecuperacao) {
      event.target.value = "";
      return;
    }
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

    // ============================================================
    // PROTEÇÃO ANTES DA RESTAURAÇÃO
    // ============================================================
    if (!recuperacaoPendente) {

    const criarBackupSeguranca = window.confirm(
      "PROTEÇÃO DOS DADOS ATUAIS\n\n" +
      "Antes de restaurar o arquivo selecionado, " +
      "é necessário salvar uma cópia de segurança " +
      "dos dados que estão atualmente no aplicativo.\n\n" +
      "Clique em OK para gerar o backup de segurança.\n\n" +
      "Cancelar interrompe a restauração."
    );

    if (!criarBackupSeguranca) {
      event.target.value = "";
      return;
    }

    const seguranca = await exportarBackupApp();

    if (!seguranca.sucesso) {
      alert(
        "Não foi possível gerar o backup de segurança.\n\n" +
        "A restauração foi cancelada. " +
        "Nenhum dado foi substituído."
      );

      event.target.value = "";
      return;
    }

    if ((seguranca.pendencias ?? []).length > 0) {
      alert(
        "O backup de segurança apresentou pendências.\n\n" +
        "A restauração foi bloqueada para evitar " +
        "a perda dos conteúdos que não foram exportados."
      );

      event.target.value = "";
      return;
    }

    const backupConfirmado = window.confirm(
      "CONFIRMAÇÃO DO BACKUP DE SEGURANÇA\n\n" +
      "Verifique se o arquivo de segurança foi salvo " +
      "na pasta de downloads do dispositivo.\n\n" +
      "Clique em OK somente depois de confirmar " +
      "que o arquivo está disponível.\n\n" +
      "Cancelar interrompe a restauração."
    );

    if (!backupConfirmado) {
      event.target.value = "";
      return;
    }
  } // Fecha if (!recuperacaoPendente)

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
        `LINKS PENDENTES\n` +
        `${resultado.linksPendentes ?? 0} links guardados\n\n` +
        `ATENÇÃO:\n` +
                `Os dados pessoais atuais serão substituídos pelos dados deste backup.\n` +
                `Exceção: se o backup antigo não contiver Links Pendentes, os links atuais serão preservados.\n\n` +
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
        resultado.backup,
        recuperacaoPendente
          ? "recuperacao"
          : "normal"
      );

    if (!restauracao.sucesso) {
      alert(restauracao.mensagem);
      event.target.value = "";
      return;
    }

    alert(
      recuperacaoPendente
        ? "Recuperação concluída. O backup de segurança foi restaurado."
        : "Backup geral restaurado com sucesso."
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
                <p className="inline-flex rounded-lg bg-green-700 px-3 py-1 text-base font-bold uppercase tracking-wide text-white">
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
                <p className="inline-flex rounded-lg bg-purple-700 px-3 py-1 text-base font-bold tracking-wide text-white">
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
        

            {/* CAPTURA RÁPIDA DE LINKS */}
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-lg font-bold text-white">
                📌 Captura Rápida
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Encontrou algo interessante? Guarde o link agora
                e organize depois.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/captura-rapida"
                  className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Guardar link
                </Link>

                <Link
                  href="/links-pendentes"
                  className="rounded-xl bg-zinc-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-600"
                >
                  Ver links pendentes
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
