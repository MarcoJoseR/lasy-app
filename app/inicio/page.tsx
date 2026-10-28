"use client";

import { useEffect, useRef, useState } from "react";
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

const [confirmacaoAberta, setConfirmacaoAberta] =
  useState(false);

const [tituloConfirmacao, setTituloConfirmacao] =
  useState("");

const [mensagemConfirmacao, setMensagemConfirmacao] =
  useState("");

const respostaConfirmacaoRef =
  useRef<((resposta: boolean) => void) | null>(null);

const recuperacaoEmAndamentoRef =
  useRef(false);

useEffect(() => {
  return () => {
    const resolver = respostaConfirmacaoRef.current;

    respostaConfirmacaoRef.current = null;

    resolver?.(false);
  };
}, []);

function solicitarConfirmacao(
  titulo: string,
  mensagem: string
): Promise<boolean> {
  if (respostaConfirmacaoRef.current) {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    respostaConfirmacaoRef.current = resolve;

    setTituloConfirmacao(titulo);
    setMensagemConfirmacao(mensagem);
    setConfirmacaoAberta(true);
  });
}

function responderConfirmacao(resposta: boolean) {
  const resolver = respostaConfirmacaoRef.current;

  respostaConfirmacaoRef.current = null;
  setConfirmacaoAberta(false);

  resolver?.(resposta);
}

async function handleExportarBackupGeral() {
  try {
    setExportandoBackup(true);

    const resultado =
      await exportarBackupApp();

    if (!resultado.sucesso) {
      alert(
        "Não foi possível guardar seus dados.\n\n" +
        "Tente novamente."
      );

      return;
    }


    const pendencias = resultado.pendencias ?? [];

    const mensagemPendencias =
      pendencias.length > 0
        ? "\n\nESTES DADOS FICARAM DE FORA:\n\n" +
          pendencias
            .map(
              (pendencia, indice) =>
                `${indice + 1}. ${pendencia.modulo} - ${pendencia.nome}\n` +
                `Motivo: ${pendencia.problema}`
            )
            .join("\n\n") +
          "\n\nEsses dados continuam no aplicativo.\n" +
          "Verifique os itens acima e faça outra cópia."
        : "";

    const titulo =
      pendencias.length > 0
        ? "Atenção! Alguns dados não entraram na cópia.\n\n"
        : "Sua cópia está pronta para baixar.\n\n";

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

    if (recuperacaoEmAndamentoRef.current) {
    event.target.value = "";
    return;
  }

  recuperacaoEmAndamentoRef.current = true;

  try {
    const recuperacaoPendente =
      verificarRestauracaoPendente();

  if (recuperacaoPendente) {
    const confirmarRecuperacao = await solicitarConfirmacao(
      "Precisamos recuperar seus dados",
      "A recuperação anterior não terminou.\n\n" +
      "Alguns dados podem estar incompletos.\n\n" +
      "Para corrigir isso, use a cópia de segurança " +
      "que você guardou ANTES daquela recuperação.\n\n" +
      "O arquivo que você escolheu agora é essa cópia?\n\n" +
      "Se for, toque em Continuar.\n" +
      "Se não tiver certeza, escolha Voltar."
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

    const criarBackupSeguranca = await solicitarConfirmacao(
      "Vamos proteger seus dados",
      "Antes de recuperar sua cópia, o aplicativo precisa " +
      "guardar os dados que estão aqui agora.\n\n" +
      "Toque em Continuar para preparar essa cópia.\n\n" +
      "Se escolher Voltar, seus dados não serão alterados."
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

    const backupConfirmado = await solicitarConfirmacao(
      "Sua cópia foi guardada?",
      "Confira se o navegador informou que o download terminou.\n\n" +
      "Se o arquivo foi baixado, toque em Continuar.\n\n" +
      "Se não tiver certeza, escolha Voltar. " +
      "Seus dados não serão substituídos."
    );

    if (!backupConfirmado) {
      event.target.value = "";
      return;
    }
  } // Fecha if (!recuperacaoPendente)

    const confirmar = await solicitarConfirmacao(
      "Deseja recuperar estes dados?",
      `HEALTH\n` +
        `${resultado.health.receitas} receitas\n` +
        `${resultado.health.listas} listas\n` +
        `${resultado.health.carrosseis} carrosséis\n` +
        `${resultado.health.prints} conjuntos de prints\n` +
        `${resultado.health.capas} capas\n\n` +
        `BAÚDIGITAL\n` +
        `${resultado.bookdigital.temas} temas\n` +
        `${resultado.bookdigital.itens} itens\n` +
        `${resultado.bookdigital.capas} capas\n` +
        `${resultado.bookdigital.imagens} conjuntos de imagens\n` +
        `${resultado.bookdigital.documentos} documentos\n\n` +
        `LINKS GUARDADOS\n` +
        `${resultado.linksPendentes ?? 0} links\n\n` +
        `ATENÇÃO\n` +
        `Os dados pessoais que estão no aplicativo agora ` +
        `serão substituídos pelos desta cópia.\n\n` +
        `Se a cópia antiga não tiver links guardados, ` +
        `os links atuais serão mantidos.\n\n` +
        `Escolha Continuar para recuperar esses dados ` +
        `ou Voltar para cancelar.`
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
  } finally {
    recuperacaoEmAndamentoRef.current = false;
  }
}

  return (
    <main className="min-h-screen bg-black text-white">
      {confirmacaoAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao"
            aria-describedby="mensagem-confirmacao"
            className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          >
            <h2
              id="titulo-confirmacao"
              className="text-xl font-bold text-white"
            >
              {tituloConfirmacao}
            </h2>

            <p
              id="mensagem-confirmacao"
              className="mt-4 min-h-0 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-zinc-300"
            >
              {mensagemConfirmacao}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => responderConfirmacao(false)}
                className="rounded-xl border border-zinc-600 px-4 py-3 font-semibold text-white"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => responderConfirmacao(true)}
                className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-lg font-bold text-white">
            🛡️ Seus dados
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* GUARDAR DADOS */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleExportarBackupGeral}
                disabled={exportandoBackup}
                className="w-full rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportandoBackup
                  ? "Guardando..."
                  : "Guardar dados"}
              </button>

              <p className="text-center text-xs text-zinc-400">
                Guarde uma cópia das suas receitas e dos itens do BaúDigital.
              </p>

              <p className="text-center text-xs leading-relaxed text-amber-400">
                ⚠️ Atenção: limpar "Cookies e dados de sites"
                no navegador pode apagar suas receitas,
                imagens, documentos e áudios.
                Faça um backup antes dessa limpeza.
              </p>
            </div>

            {/* RECUPERAR DADOS */}
            <div className="flex flex-col items-center gap-2">
              <label
                className={`block w-full rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white transition ${
                  importandoBackup
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-blue-500"
                }`}
              >
                {importandoBackup
                  ? "Recuperando..."
                  : "Recuperar dados"}

                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportarBackupGeral}
                  disabled={importandoBackup}
                  className="hidden"
                />
              </label>

              <p className="text-center text-xs text-zinc-400">
                Use uma cópia guardada anteriormente para recuperar seus dados.
              </p>
            </div>
          </div>
        </div>


        {/* RODAPÉ */}
        <p className="mt-10 text-center text-xs text-zinc-600">
          Organize hoje. Encontre quando precisar.
        </p>
      </div>
    </main>
  );
}
