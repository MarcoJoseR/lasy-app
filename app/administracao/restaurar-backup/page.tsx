"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";

import {
  validarBackupHomeAdm,
  restaurarHomeAdm,
} from "@/app/utils/importarHomeAdm";

export default function RestaurarBackupHomeAdmPage() {
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [erro, setErro] = useState("");
  const [arquivoValido, setArquivoValido] = useState(false);

  const [receitasEncontradas, setReceitasEncontradas] = useState(0);
  const [carrosseisEncontrados, setCarrosseisEncontrados] = useState(0);

  const [backupValidado, setBackupValidado] = useState<any>(null);

  const [restaurando, setRestaurando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function handleSelecionarArquivo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    setNomeArquivo("");
    setErro("");
    setArquivoValido(false);
    setReceitasEncontradas(0);
    setCarrosseisEncontrados(0);
    setBackupValidado(null);
    setMensagem("");

    if (!arquivo) return;

    setNomeArquivo(arquivo.name);

    const resultado = await validarBackupHomeAdm(arquivo);

    if (!resultado.valido || !resultado.backup) {
      setErro(resultado.mensagem);
      return;
    }

    setArquivoValido(true);
    setReceitasEncontradas(resultado.receitasEncontradas);
    setCarrosseisEncontrados(resultado.carrosseisEncontrados);
    setBackupValidado(resultado.backup);
  }

  async function handleRestaurar() {
    if (!backupValidado) return;

    const confirmar = confirm(
      `Restaurar a Home ADM a partir deste backup?\n\n` +
        `Receitas oficiais encontradas: ${receitasEncontradas}\n` +
        `Carrosséis com imagens: ${carrosseisEncontrados}\n\n` +
        `ATENÇÃO: as receitas oficiais atuais da Home ADM serão substituídas.\n` +
        `As receitas pessoais serão preservadas.`
    );

    if (!confirmar) return;

    try {
      setRestaurando(true);
      setMensagem("");

      const resultado = await restaurarHomeAdm(backupValidado);

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(
        `✅ Home ADM restaurada com sucesso.\n` +
          `${receitasEncontradas} receitas oficiais e ` +
          `${carrosseisEncontrados} conjunto(s) de carrossel restaurado(s).`
      );
    } finally {
      setRestaurando(false);
    }
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/administracao"
            className="inline-block rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 transition hover:border-yellow-500 hover:bg-gray-800"
          >
            ← Voltar para ADM
          </Link>
        </div>

        <div className="rounded-xl border border-gray-700 bg-zinc-900 p-6 shadow-xl">
          <h1 className="mb-3 text-2xl font-bold">
            ♻️ Restaurar Backup Home ADM
          </h1>

          <p className="mb-2 text-gray-300">
            Selecione um backup específico da Home ADM.
          </p>

          <p className="mb-6 text-sm text-gray-400">
            O arquivo será validado antes da restauração.
            Nenhum dado será alterado apenas pela seleção do arquivo.
          </p>

          <label className="inline-block cursor-pointer rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-500">
            📂 Selecionar backup da Home ADM

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleSelecionarArquivo}
              className="hidden"
            />
          </label>

          {nomeArquivo && (
            <p className="mt-4 text-sm text-gray-300">
              Arquivo:{" "}
              <span className="font-semibold text-white">
                {nomeArquivo}
              </span>
            </p>
          )}

          {erro && (
            <div className="mt-5 rounded-lg border border-red-700 bg-red-950 p-4 text-red-200">
              ⚠️ {erro}
            </div>
          )}

          {arquivoValido && (
            <div className="mt-6 rounded-lg border border-green-700 bg-green-950/40 p-4">
              <h2 className="mb-3 text-lg font-semibold text-green-300">
                ✅ Backup Home ADM válido
              </h2>

              <p>Receitas oficiais: {receitasEncontradas}</p>
              <p>Carrosséis com imagens: {carrosseisEncontrados}</p>

              <div className="mt-5 rounded-lg border border-yellow-700 bg-yellow-950/30 p-4 text-yellow-200">
                ⚠️ A restauração substituirá somente as receitas oficiais
                atuais da Home ADM. Receitas pessoais serão preservadas.
              </div>

              <button
                type="button"
                onClick={handleRestaurar}
                disabled={restaurando}
                className="mt-5 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restaurando
                  ? "Restaurando..."
                  : "♻️ Restaurar Home ADM"}
              </button>
            </div>
          )}

          {mensagem && (
            <div className="mt-5 whitespace-pre-line rounded-lg border border-green-700 bg-green-950/40 p-4 text-green-200">
              {mensagem}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}