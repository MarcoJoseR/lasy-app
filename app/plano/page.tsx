"use client";

import { useEffect, useState } from "react";
import { receitas as receitasIniciais } from "../data/receitas";

const diasSemana = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const ordemDias = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

export default function PlanoSemanal() {
  const [plano, setPlano] = useState<any>({});
  const [receitas, setReceitas] = useState<any[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [pessoas, setPessoas] = useState(1);
  // 🔹 carregar receitas
  useEffect(() => {
  const dadosReceitas = localStorage.getItem("receitas");

  if (dadosReceitas) {
    setReceitas(JSON.parse(dadosReceitas));
  } else {
    setReceitas(receitasIniciais);
  }
}, []);

  // 🔹 carregar plano
useEffect(() => {
  const dadosPlano = localStorage.getItem("planoSemanal");

  if (dadosPlano) {
    setPlano(JSON.parse(dadosPlano));
  }
}, []);

  // 🔹 salvar plano
  useEffect(() => {
  if (!carregado) return;

  localStorage.setItem("planoSemanal", JSON.stringify(plano));
}, [plano, carregado]);

  const definirReceita = (dia: string, receitaId: string) => {
    setPlano((prev: any) => ({
      ...prev,
      [dia]: receitaId,
    }));
  };

  useEffect(() => {
  if (receitas.length > 0) {
    setCarregado(true);
  }
}, [receitas]);

  const limparDia = (dia: string) => {
    setPlano((prev: any) => {
      const novo = { ...prev };
      delete novo[dia];
      return novo;
    });
  };

  
const getDuracao = () => {
  if (pessoas === 1) return 3;
  if (pessoas === 2) return 2;
  return 1;
};

  const repetirReceita = (diaAtual: string, receitaId: string) => {
  if (!receitaId) return;

  const duracao = getDuracao();
  const index = ordemDias.indexOf(diaAtual);

  const novosDias: any = {};

  for (let i = 0; i < duracao; i++) {
    const dia = ordemDias[index + i];

    if (dia && !plano[dia]) {
      novosDias[dia] = receitaId;
    }
  }

  setPlano((prev: any) => ({
    ...prev,
    ...novosDias,
  }));
};

  const getReceita = (id: any) => {
    return receitas.find((r) => String(r.id) === String(id));
  };

if (!carregado) return null;

const gerarListaCompras = () => {
  const receitasUnicas: any = {};

  Object.values(plano).forEach((id) => {
    if (!id) return;

    receitasUnicas[id] = true; // garante unicidade
  });

  const ingredientes: string[] = [];

  Object.keys(receitasUnicas).forEach((id) => {
    const receita = receitas.find(
      (r) => String(r.id) === String(id)
    );

    if (receita) {
      ingredientes.push(...receita.ingredientes);
    }
  });

  return [...new Set(ingredientes)];
};

  return (
  <main className="p-6 max-w-2xl mx-auto text-white space-y-6">
    <h1 className="text-3xl font-bold">📅 Plano Semanal</h1>

    {/* 🛒 LISTA DE COMPRAS */}
    {/* 👥 PESSOAS */}
<div className="bg-zinc-900 p-4 rounded-xl">
  <h2 className="text-xl font-semibold mb-3">
    👥 Quantas pessoas vão comer?
  </h2>

  <select
    value={pessoas}
    onChange={(e) => setPessoas(Number(e.target.value))}
    className="w-full p-2 rounded bg-zinc-800"
  >
    <option value={1}>1 pessoa</option>
    <option value={2}>2 pessoas</option>
    <option value={3}>3 pessoas</option>
    <option value={4}>4 ou mais</option>
  </select>
</div>

{/* 🛒 LISTA DE COMPRAS */}
<div className="bg-zinc-900 p-4 rounded-xl">
  <h2 className="text-xl font-semibold mb-3">
    🛒 Lista de Compras
  </h2>

  {gerarListaCompras().length === 0 ? (
    <p className="text-zinc-400">
      Nenhum item ainda
    </p>
  ) : (
    <ul className="space-y-2">
      {gerarListaCompras().map((item, index) => (
        <li
          key={index}
          className="bg-zinc-800 p-2 rounded"
        >
          {item}
        </li>
      ))}
    </ul>
  )}
</div>
    
     {diasSemana.map((dia) => {
  const receitaSelecionada = getReceita(plano[dia.key]);

  return (
    <div
      key={dia.key}
      className={`p-4 rounded-xl space-y-3 ${
        plano[dia.key]
          ? "bg-green-900/40 border border-green-700"
          : "bg-zinc-900"
      }`}
    >
      <strong>{dia.label}</strong>

      <select
        value={plano[dia.key] ?? ""}
        onChange={(e) =>
          definirReceita(dia.key, e.target.value)
        }
        className="w-full p-2 rounded bg-zinc-800"
      >
        <option value="">Selecionar receita</option>

        {receitas.map((r) => (
          <option key={r.id} value={String(r.id)}>
            {r.nome}
          </option>
        ))}
      </select>

      {receitaSelecionada && (
        <div className="flex items-center justify-between gap-3 mt-2">

          <div className="flex items-center gap-3">
            <img
              src={receitaSelecionada.imagem}
              alt={receitaSelecionada.nome}
              className="w-12 h-12 object-cover rounded-lg"
            />

            <span className="text-green-400 text-sm font-medium">
              ✔ {receitaSelecionada.nome}
            </span>
          </div>

          <div className="flex gap-3 text-sm">
            <button
              onClick={() => repetirReceita(dia.key, plano[dia.key])}
              className="text-blue-400 hover:text-blue-300"
            >
              Repetir
            </button>

            <button
              onClick={() => limparDia(dia.key)}
              className="text-red-400 hover:text-red-300"
            >
              Remover
            </button>
          </div>

        </div>
      )}

    </div>
  );
})} 
    </main>
  );
}