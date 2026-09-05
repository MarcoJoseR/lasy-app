"use client";

import Link from "next/link";
import DataHoraAtual from "@/app/components/DataHoraAtual";
import { exportarMinhaBiblioteca } from "@/app/utils/exportarMinhaBiblioteca";

import {
  validarBackupMinhaBiblioteca,
  restaurarMinhaBiblioteca,
} from "@/app/utils/importarMinhaBiblioteca";

import { useReceitas } from "@/app/context/ReceitasContext";

export default function RecepcaoPage() {
  
const { receitas, carregado } = useReceitas();

const colecaoInicial = receitas
  .filter((receita) => receita.colecaoInicial === true)
  .slice(0, 10);

const categorias = Array.from(
  new Set(
    receitas
      .filter((receita) => receita.colecaoInicial === true)
      .map((receita) => String(receita.categoria || ""))
      .filter((categoria) => categoria !== "")
  )
).sort((a, b) =>
  a.localeCompare(b, "pt-BR")
);

function iconeCategoria(categoria: string) {
  const nome = categoria.toLowerCase();

  if (nome.includes("salada")) return "🥗";
  if (nome.includes("sopa") || nome.includes("caldo")) return "🥣";
  if (nome.includes("carne")) return "🥩";
  if (nome.includes("frango") || nome.includes("aves")) return "🍗";
  if (nome.includes("peixe") || nome.includes("frutos do mar")) return "🐟";
  if (nome.includes("massa")) return "🍝";
  if (nome.includes("arroz") || nome.includes("risoto")) return "🍚";
  if (nome.includes("bolo") || nome.includes("doce") || nome.includes("sobremesa")) return "🍰";
  if (nome.includes("café") || nome.includes("cafe")) return "☕";
  if (nome.includes("lanche")) return "🥪";
  if (nome.includes("pão") || nome.includes("pao")) return "🥖";
  if (nome.includes("molho") || nome.includes("pasta")) return "🥫";
  if (nome.includes("bebida") || nome.includes("drink")) return "🥤";
  if (nome.includes("vegetar")) return "🥬";
  if (nome.includes("legume") || nome.includes("vegetal")) return "🥕";

  return "🍽️";
}

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
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-8">
    
      <DataHoraAtual />

     {/* RECEPÇÃO */}
    <section className="mb-8 overflow-hidden rounded-2xl border border-pink-300/30 bg-gradient-to-br from-[#C52A68] via-[#A91F59] to-[#7A1643] p-7 shadow-xl">
      <div className="flex items-center gap-5">

        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-purple-950 shadow-md">
          <img
            src="/icons/health-simbolo-branco.png"
            alt="Receitas Health"
            className="h-16 w-16 object-contain brightness-150 contrast-125"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            O que vamos preparar?
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-violet-100/80">
            Encontre uma receita ou descubra o que preparar
            com os ingredientes que você já tem.
          </p>
        </div>

      </div>
    </section>

        {/* PREPARAR UMA REFEIÇÃO */}
        <section className="mb-8 rounded-lg border border-gray-700 bg-gray-950 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">
              Como você quer pesquisar?
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Escolha o caminho mais fácil para decidir o que preparar.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/recepcao/o-que-tenho"
              className="rounded-lg border border-gray-700 bg-gray-900 p-6 transition hover:border-green-500 hover:bg-gray-800"
            >
              <h2 className="mb-2 text-xl font-bold text-violet-300">
                🥕 Os ingredientes que tenho
              </h2>

              <p className="text-gray-300">
                Informe os ingredientes disponíveis e descubra
                quais receitas você pode preparar agora.
              </p>
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-gray-700 bg-gray-900 p-6 transition hover:border-yellow-500 hover:bg-gray-800"
            >
              <h2 className="mb-2 text-xl font-bold text-violet-300">
                🔎 Pesquisar receitas
              </h2>

              <p className="text-gray-300">
                Encontre uma receita e depois providencie os
                ingredientes faltantes.
              </p>
            </Link>
          </div>
        </section>

{/* COLEÇÃO INICIAL */}
<section className="mb-8">
  <div className="mb-4 flex items-end justify-between">
    <div>
      <h2 className="text-xl font-bold text-white">
        Coleção Inicial
      </h2>

      <p className="mt-1 text-sm text-gray-400">
        Algumas sugestões para você começar.
      </p>
    </div>

    <Link
      href="/"
      className="text-sm font-medium text-violet-300 hover:text-violet-200"
    >
      Ver todas →
    </Link>
  </div>

  {!carregado ? (
    <p className="text-sm text-gray-500">
      Carregando receitas...
    </p>
  ) : (
    <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {colecaoInicial.map((receita) => (
        <Link
          key={receita.id}
          href={`/receita/${receita.id}`}
          className="w-48 shrink-0 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 transition hover:border-violet-500 hover:bg-gray-800"
        >
          <div className="h-32 w-full overflow-hidden bg-gray-800">
            {receita.imagem ? (
              <img
                src={receita.imagem}
                alt={receita.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl">
                🍽️
              </div>
            )}
          </div>

          <div className="p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
              {receita.nome}
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              {receita.categoria}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )}
</section>

{/* CATEGORIAS */}
<section className="mb-8">
  <div className="mb-4">
    <h2 className="text-xl font-bold text-white">
      Categorias
    </h2>

    <p className="mt-1 text-sm text-gray-400">
      Escolha uma categoria para explorar.
    </p>
  </div>

  <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {categorias.map((categoria) => (
      <Link
        key={categoria}
        href={`/?categoria=${encodeURIComponent(
          String(categoria)
        )}`}
        className="flex min-w-32 shrink-0 flex-col items-center justify-center rounded-xl border border-violet-500/30 bg-violet-950/60 px-4 py-4 text-center transition hover:border-violet-400 hover:bg-violet-900"
      >
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#B51F5A] text-3xl shadow-md">
          {iconeCategoria(categoria)}
        </div>

        <span className="text-sm font-medium text-white">
          {categoria}
        </span>
      </Link>
    ))}
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

      {/* NAVEGAÇÃO INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="mx-auto grid max-w-4xl grid-cols-4 px-2">

          <Link
            href="/recepcao"
            className="flex flex-col items-center justify-center gap-1 py-3 md:py-4 text-[#C52A68]"
          >
            <span className="text-2xl leading-none">
              ⌂
            </span>

            <span className="text-xs font-semibold">
              Início
            </span>
          </Link>

          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 py-3 text-gray-400 transition hover:text-white"
          >
            <span className="text-2xl leading-none">
              🔎
            </span>

            <span className="text-xs font-medium">
              Pesquisar
            </span>
          </Link>

          <Link
            href="/favoritos"
            className="flex flex-col items-center justify-center gap-1 py-3 text-gray-400 transition hover:text-white"
          >
            <span className="text-2xl leading-none">
              ▣
            </span>

            <span className="text-xs font-medium">
              Minha Biblioteca
            </span>
          </Link>

          <div
            className="flex cursor-default flex-col items-center justify-center gap-1 py-3 text-gray-600"
            title="Perfil — em breve"
          >
            <span className="text-2xl leading-none md:text-3xl">
              ♙
            </span>

            <span className="text-xs font-semibold md:text-sm">
              Perfil
            </span>
          </div>

        </div>
      </nav>
    </main>
  );
}