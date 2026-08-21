"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ImportarReceitaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const url = searchParams.get("url") || "";

// ===== INÍCIO - SEPARAÇÃO DO TEXTO RECEBIDO =====

let ingredientes = "";
let modoPreparo = "";

const linhas = text.split("\n");

const indiceIngredientes = linhas.findIndex((linha) => {
  const texto = linha
    .trim()
    .replace(/^[^A-Za-zÀ-ÿ]*/, "")
    .toLowerCase();

  return (
    texto === "ingredientes" ||
    texto === "ingredientes:"
  );
});

const indicePreparo = linhas.findIndex((linha) => {
  const texto = linha.trim().toLowerCase();

  return (
    texto.includes("modo de preparo") ||
    texto.includes("modo de fazer")
  );
});

if (
  indiceIngredientes !== -1 &&
  indicePreparo !== -1 &&
  indicePreparo > indiceIngredientes
) {
  ingredientes = linhas
    .slice(indiceIngredientes + 1, indicePreparo)
    .join("\n")
    .trim();
}

if (
  indiceIngredientes === -1 &&
  indicePreparo !== -1
) {
  ingredientes = linhas
    .slice(0, indicePreparo)
    .join("\n")
    .trim();
}

if (indicePreparo !== -1) {
  modoPreparo = linhas
    .slice(indicePreparo + 1)
    .join("\n")
    .trim();
}

// ===== FALLBACK FINAL - PRESERVAR CONTEÚDO =====

if (
  indiceIngredientes === -1 &&
  indicePreparo === -1
) {
  ingredientes = text.trim();
}

// ===== FIM - SEPARAÇÃO DO TEXTO RECEBIDO =====

// ===== INÍCIO - TRANSFERÊNCIA PARA O FORMULÁRIO =====

function continuarParaFormulario() {
  const dadosImportados = {
  nome: title,
  ingredientesTexto: ingredientes,
  modoPreparoTexto: modoPreparo,
  origem: url,
};

  sessionStorage.setItem(
    "receitaImportadaPendente",
    JSON.stringify(dadosImportados)
  );

  router.push("/minha-receita?importar=1");
}

// ===== FIM - TRANSFERÊNCIA PARA O FORMULÁRIO =====

  return (
    <main className="mx-auto max-w-3xl p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">
        📥 Importar Receita
      </h1>

      <div className="space-y-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-zinc-400">
            Título recebido
          </p>

          <div className="rounded-lg bg-zinc-900 p-3">
            {title || "Nenhum título recebido"}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-zinc-400">
            Texto recebido
          </p>

          <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3">
            {text || "Nenhum texto recebido"}
          </div>
        </div>

{/* ===== INÍCIO - CONFERÊNCIA DA SEPARAÇÃO ===== */}

<div>
  <p className="mb-1 text-sm font-semibold text-green-400">
    Ingredientes identificados
  </p>

  <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3">
    {ingredientes || "Ingredientes não identificados"}
  </div>
</div>

<div>
  <p className="mb-1 text-sm font-semibold text-green-400">
    Modo de Preparo identificado
  </p>

  <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3">
    {modoPreparo || "Modo de Preparo não identificado"}
  </div>
</div>

{/* ===== FIM - CONFERÊNCIA DA SEPARAÇÃO ===== */}

        <div>
          <p className="mb-1 text-sm font-semibold text-zinc-400">
            Link recebido
          </p>

          <div className="break-all rounded-lg bg-zinc-900 p-3">
            {url || "Nenhum link recebido"}
          </div>
        </div>
      
      {/* ===== INÍCIO - CONTINUAR PARA O FORMULÁRIO ===== */}

        <button
          type="button"
          onClick={continuarParaFormulario}
          className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Continuar para o formulário
        </button>

        {/* ===== FIM - CONTINUAR PARA O FORMULÁRIO ===== */}
      
      </div>
    </main>
  );
}