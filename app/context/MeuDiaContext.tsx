"use client";

import { createContext, useContext, useState } from "react";

/* ======================================================
   TIPOS
====================================================== */

export type PeriodoDia = "cafe" | "almoco" | "lanche" | "jantar";

export interface RefeicaoDoDia {
  id: string;
  data: string; // YYYY-MM-DD
  periodo: PeriodoDia;

  receita_id: number;
  receita_nome: string;
  receita_imagem: string;

  created_at?: string;
}

export interface MeuDiaState {
  cafe: RefeicaoDoDia[];
  almoco: RefeicaoDoDia[];
  lanche: RefeicaoDoDia[];
  jantar: RefeicaoDoDia[];
}

interface MeuDiaContextType {
  refeicoes: MeuDiaState;
  carregando: boolean;

  carregarMeuDia: () => Promise<void>;
  adicionarRefeicao: (
    periodo: PeriodoDia,
    receita: {
      id: number;
      nome: string;
      imagem: string;
    }
  ) => Promise<void>;
  removerRefeicao: (id: string) => Promise<void>;
}

/* ======================================================
   ESTADO INICIAL
====================================================== */

const estadoInicial: MeuDiaState = {
  cafe: [],
  almoco: [],
  lanche: [],
  jantar: [],
};

/* ======================================================
   FUNÇÃO AUXILIAR (DATA)
====================================================== */

function getHojeISO(): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje.toISOString().split("T")[0];
}

/* ======================================================
   CONTEXTO
====================================================== */

const MeuDiaContext = createContext<MeuDiaContextType | null>(null);

/* ======================================================
   PROVIDER
====================================================== */

export function MeuDiaProvider({ children }: { children: React.ReactNode }) {
  const [refeicoes, setRefeicoes] = useState<MeuDiaState>(estadoInicial);
  const [carregando, setCarregando] = useState(false);

  /* ------------------------------
     1️⃣ CARREGAR MEU DIA (GET)
  ------------------------------ */
  async function carregarMeuDia() {
    try {
      setCarregando(true);

      const data = getHojeISO();
      const res = await fetch(`/api/refeicoes-dia?data=${data}`);
      const lista: RefeicaoDoDia[] = await res.json();

      const organizado: MeuDiaState = {
        cafe: [],
        almoco: [],
        lanche: [],
        jantar: [],
      };

      lista.forEach((item) => {
        organizado[item.periodo].push(item);
      });

      setRefeicoes(organizado);
    } catch (error) {
      console.error("Erro ao carregar Meu Dia:", error);
    } finally {
      setCarregando(false);
    }
  }

  /* ------------------------------
     2️⃣ ADICIONAR REFEIÇÃO (POST)
  ------------------------------ */
async function adicionarRefeicao(
  periodo: PeriodoDia,
  receita: { id: number; nome: string; imagem: string }
) {
  try {
    const data = getHojeISO();

    const res = await fetch("/api/refeicoes-dia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        periodo,
        receitaId: receita.id,
      }),
    });

    if (!res.ok) {
      throw new Error("Erro ao adicionar refeição ao Meu Dia");
    }

    const nova: RefeicaoDoDia = await res.json();

   setRefeicoes((prev) => ({
    ...prev,
  [periodo]: [...prev[periodo], nova],
}));

  } catch (error) {
    console.error("Erro ao adicionar refeição:", error);
  }
}

        /* ------------------------------
     3️⃣ REMOVER REFEIÇÃO (DELETE)
  ------------------------------ */
  async function removerRefeicao(id: string) {
    try {
      await fetch(`/api/refeicoes-dia?id=${id}`, {
        method: "DELETE",
      });

      setRefeicoes((prev) => ({
        cafe: prev.cafe.filter((r) => r.id !== id),
        almoco: prev.almoco.filter((r) => r.id !== id),
        lanche: prev.lanche.filter((r) => r.id !== id),
        jantar: prev.jantar.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error("Erro ao remover refeição:", error);
    }
  }

  return (
    <MeuDiaContext.Provider
      value={{
        refeicoes,
        carregando,
        carregarMeuDia,
        adicionarRefeicao,
        removerRefeicao,
      }}
    >
      {children}
    </MeuDiaContext.Provider>
  );
}

/* ======================================================
   HOOK
====================================================== */

export function useMeuDia() {
  const context = useContext(MeuDiaContext);

  if (!context) {
    throw new Error("useMeuDia deve ser usado dentro de um MeuDiaProvider");
  }

  return context;
}

