"use client";

import Link from "next/link";
import DataHoraAtual from "@/app/components/DataHoraAtual";
import { exportarMinhaBiblioteca } from "@/app/utils/exportarMinhaBiblioteca";

import {
  validarBackupMinhaBiblioteca,
  restaurarMinhaBiblioteca,
} from "@/app/utils/importarMinhaBiblioteca";

export default function RecepcaoPage() {
  
  async function handleExportarBiblioteca() {
    const resultado =
      await exportarMinhaBiblioteca();

    if (resultado.sucesso) {
      alert(
        `Biblioteca exportada com sucesso.\n\n` +
          `${resultado.receitasExportadas} receitas\n` +
          `${resultado.listasExportadas} listas de compras\n` +
          `${resultado.carrosseisExportados} carrosséis com imagens`
      );
    } else {
      alert("Não foi possível exportar a Minha Biblioteca.");
    }
  }

  async function handleImportarBiblioteca(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    const resultado = await validarBackupMinhaBiblioteca(arquivo);

    if (!resultado.valido) {
      alert(resultado.mensagem);
      event.target.value = "";
      return;
    }

        const confirmar = window.confirm(
      `Backup válido.\n\n` +
        `${resultado.receitasEncontradas} receitas encontradas\n` +
        `${resultado.listasEncontradas} listas de compras encontradas\n` +
        `${resultado.carrosseisEncontrados} carrosséis com imagens encontrados\n\n` +
       `ATENÇÃO:\n` +
        `Os dados atuais da Minha Biblioteca serão substituídos pelos dados deste backup.\n\n` +
        `Deseja continuar?`
    );

    if (!confirmar) {
      event.target.value = "";
      return;
    }

    if (!resultado.backup) {
      alert("Não foi possível localizar os dados do backup.");
      event.target.value = "";
      return;
    }

    const restauracao =
      await restaurarMinhaBiblioteca(resultado.backup);
    if (!restauracao.sucesso) {
      alert(restauracao.mensagem);
      event.target.value = "";
      return;
    }

    alert("Minha Biblioteca foi restaurada com sucesso.");

    window.location.reload();

    event.target.value = "";
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        
      <DataHoraAtual />

      {/* RECEPÇÃO */}
      <section className="mb-8 rounded-lg border border-orange-700 bg-orange-950/70 p-6">
        <h1 className="mb-2 text-3xl font-bold">
           🍳O que vamos preparar?
        </h1>

        <p className="text-gray-300">
           Escolha como deseja encontrar algo pra comer.
         </p>
       </section>

        {/* PREPARAR UMA REFEIÇÃO */}
        <section className="mb-8 rounded-lg border border-gray-700 bg-gray-950 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">
              Comece por aqui
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Escolha uma das opções abaixo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/recepcao/o-que-tenho"
              className="rounded-lg border border-gray-700 bg-gray-900 p-6 transition hover:border-green-500 hover:bg-gray-800"
            >
              <h2 className="mb-2 text-xl font-bold text-green-400">
                🥘 Cozinhar com o que tenho
              </h2>

              <p className="text-gray-300">
                Informe os ingredientes disponíveis e encontre uma receita
                possível para preparar agora.
              </p>
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-gray-700 bg-gray-900 p-6 transition hover:border-yellow-500 hover:bg-gray-800"
            >
              <h2 className="mb-2 text-xl font-bold text-yellow-400">
                🍽️ Escolher uma receita
              </h2>

              <p className="text-gray-300">
                Encontre uma receita e depois providencie os
                ingredientes faltantes.
              </p>
            </Link>
          </div>
        </section>

        {/* RECURSOS DA COZINHA */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">
              Recursos da sua cozinha
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Consulte seus acervos para encontrar, organizar ou escolher
              receitas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/favoritos"
              className="rounded-lg border border-gray-700 bg-gray-900 p-4 transition hover:bg-gray-800"
            >
              <h2 className="font-semibold text-white">
                📚 Minha Biblioteca
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Consulte e organize suas receitas.
              </p>
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-gray-700 bg-gray-900 p-4 transition hover:bg-gray-800"
            >
              <h2 className="font-semibold text-white">
                🔎 Pesquisar Receitas
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Utilize todos os recursos disponíveis para pesquisar e escolher receitas.
              </p>
            </Link>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleExportarBiblioteca}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-4 text-left transition hover:border-blue-500 hover:bg-gray-800"
            >
              <h2 className="font-semibold text-white">
                📤 Exportar Minha Biblioteca
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Salve uma cópia das suas receitas e listas de compras.
              </p>
            </button>
          </div>

          <div className="mt-3">
            <label className="block w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-900 p-4 transition hover:border-blue-500 hover:bg-gray-800">
              <h2 className="font-semibold text-white">
                📥 Importar Minha Biblioteca
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Selecione um backup do Receitas Health para verificar os dados.
              </p>

              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportarBiblioteca}
                className="hidden"
              />
            </label>
          </div>
        </section>
      </div>
    </main>
  );
}