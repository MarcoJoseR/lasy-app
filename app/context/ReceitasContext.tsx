"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { backupCompletoLocalStorage } from "@/app/utils/backupCompletoLocalStorage";

import { gerarId } from "@/app/utils/gerarId";

import { RECEITAS_INICIAIS } from "@/app/data/dadosIniciais";

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export type TipoReceita = "pessoal" | "oficial";

export interface Receita {
  id: string;
  nome: string;
  slug?: string;

  categoria: string;
  subCategoria?: string;

  ingredientes: string[];
  modoPreparo: string[];

  tempo?: string;
  porcoes?: string;

  imagem?: string;
  video?: string;

  tipoConteudo?: "receita" | "carrossel";

  carrossel?: {
    imagens: string[];
    titulo?: string;
    origemUrl?: string;
  };

  tags?: string[];

  resumo?: string;
  origem?: string;

  nutricao?: NutritionInfo;

  favorito?: boolean;
  preparacoes?: string[];

  tipo: "oficial" | "pessoal";
  colecaoInicial?: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

interface ReceitasContextType {
  receitas: Receita[];
  carregado: boolean;
  adicionarReceita: (receita: Omit<Receita, "id" | "tipo" | "criadoEm" | "atualizadoEm">) => void;
  
adicionarReceitaOficial: (
    receita: Omit<
      Receita,
      "id" | "tipo" | "criadoEm" | "atualizadoEm"
    >
  ) => void;

  adicionarNaBiblioteca: (receita: Receita) => Receita;
  
  removerReceita: (id: string) => void;
  toggleFavorito: (id: string) => void;
  registrarPreparacao: (id: string) => void;

  atualizarReceita: (
    id: string,
    dadosAtualizados: Partial<Omit<Receita, "id" | "criadoEm">>
  ) => void;
}

const ReceitasContext = createContext<ReceitasContextType | undefined>(
  undefined
);

const STORAGE_KEY = "minhaBiblioteca";

export function ReceitasProvider({ children }: { children: ReactNode }) {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [carregado, setCarregado] = useState(false);

 useEffect(() => {
  try {
    const CHAVE_INICIALIZACAO = "healthReceitasInicializadoV1";

    const jaInicializado =
      localStorage.getItem(CHAVE_INICIALIZACAO) === "1";

    const dadosSalvos = localStorage.getItem(STORAGE_KEY);

    if (!jaInicializado) {
      if (dadosSalvos) {
        const receitasSalvas = JSON.parse(dadosSalvos) as Receita[];

        if (receitasSalvas.length > 0) {
          setReceitas(receitasSalvas);
        } else {
          setReceitas(RECEITAS_INICIAIS);
        }
      } else {
        setReceitas(RECEITAS_INICIAIS);
      }

      localStorage.setItem(CHAVE_INICIALIZACAO, "1");
    } else if (dadosSalvos) {
      const receitasSalvas = JSON.parse(dadosSalvos) as Receita[];
      setReceitas(receitasSalvas);
    }
  } catch (error) {
    console.error("Erro ao carregar Minha Biblioteca:", error);
  } finally {
    setCarregado(true);
  }
}, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receitas));
    }
  }, [receitas, carregado]);

useEffect(() => {
  if (!carregado) return;

  function recarregarReceitas() {
    try {
      const dadosSalvos = localStorage.getItem(STORAGE_KEY);

      if (!dadosSalvos) return;

      const receitasSalvas = JSON.parse(dadosSalvos) as Receita[];
      setReceitas(receitasSalvas);
    } catch (error) {
      console.error("Erro ao atualizar receitas:", error);
    }
  }

  function aoFicarVisivel() {
    if (document.visibilityState === "visible") {
      recarregarReceitas();
    }
  }

  window.addEventListener("pageshow", recarregarReceitas);
  window.addEventListener("popstate", recarregarReceitas);
  document.addEventListener("visibilitychange", aoFicarVisivel);

  return () => {
    window.removeEventListener("pageshow", recarregarReceitas);
    window.removeEventListener("popstate", recarregarReceitas);
    document.removeEventListener("visibilitychange", aoFicarVisivel);
  };
}, [carregado]);

  function adicionarReceita(
    receita: Omit<Receita, "id" | "tipo" | "criadoEm" | "atualizadoEm">
  ) {
    const agora = new Date().toISOString();

    const novaReceita: Receita = {
      ...receita,
      id: gerarId(),
      tipo: "pessoal",
      criadoEm: agora,
      atualizadoEm: agora,
    };

    setReceitas((receitasAtuais) => [...receitasAtuais, novaReceita]);
  }

useEffect(() => {
  if (!carregado) return;

  const verificarBackupDiario = async () => {
    const agora = new Date();

    if (agora.getHours() < 21) return;

    const hoje =
      agora.getFullYear() +
      "-" +
      String(agora.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(agora.getDate()).padStart(2, "0");

    const chaveControle = "ultimoBackupCompletoAutomatico";

    const ultimoBackup = localStorage.getItem(chaveControle);

    if (ultimoBackup === hoje) return;

    const resultado = await backupCompletoLocalStorage();

    if (resultado.sucesso) {
      localStorage.setItem(chaveControle, hoje);

      console.log(
        "Backup completo automático realizado:",
        resultado.nomeArquivo
      );
    } else {
      console.error(
        "Não foi possível realizar o backup completo automático."
      );
    }
  };

  verificarBackupDiario();

  const intervalo = window.setInterval(
    verificarBackupDiario,
    60 * 1000
  );

  return () => {
    window.clearInterval(intervalo);
  };
}, [carregado]);

function adicionarReceitaOficial(
  receita: Omit<Receita, "id" | "tipo" | "criadoEm" | "atualizadoEm">
) {
  const agora = new Date().toISOString();

  const novaReceita: Receita = {
    ...receita,
    id: crypto.randomUUID(),
    tipo: "oficial",
    criadoEm: agora,
    atualizadoEm: agora,
  };

  setReceitas((receitasAtuais) => [
    ...receitasAtuais,
    novaReceita,
  ]);
}

function adicionarNaBiblioteca(receita: Receita): Receita {
  const agora = new Date().toISOString();

  const novaReceita: Receita = {
    ...receita,
    id: crypto.randomUUID(),
    tipo: "pessoal",
    colecaoInicial: false,
    favorito: false,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  setReceitas((receitasAtuais) => {
  const receitasAtualizadas = [
    ...receitasAtuais,
    novaReceita,
  ];

  // Grava imediatamente antes de qualquer navegação.
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(receitasAtualizadas)
  );

  return receitasAtualizadas;
});

return novaReceita;
}

   function removerReceita(id: string) {
    setReceitas((receitasAtuais) =>
      receitasAtuais.filter((receita) => receita.id !== id)
    );
  }

  function registrarPreparacao(id: string) {
    const agora = new Date().toISOString();

    setReceitas((receitasAtuais) =>
      receitasAtuais.map((receita) =>
        receita.id === id
          ? {
              ...receita,
              preparacoes: [...(receita.preparacoes || []), agora],
            }
          : receita
      )
    );
  }

  function toggleFavorito(id: string) {
    const agora = new Date().toISOString();

    setReceitas((receitasAtuais) =>
      receitasAtuais.map((receita) =>
        receita.id === id
          ? {
              ...receita,
              favorito: !receita.favorito,
              atualizadoEm: agora,
            }
          : receita
      )
    );
  }

  function atualizarReceita(
    id: string,
    dadosAtualizados: Partial<Omit<Receita, "id" | "criadoEm">>
  ) {
    const agora = new Date().toISOString();

    setReceitas((receitasAtuais) =>
      receitasAtuais.map((receita) =>
        receita.id === id
          ? {
              ...receita,
              ...dadosAtualizados,
              atualizadoEm: agora,
            }
          : receita
      )
    );
  }

  return (
    <ReceitasContext.Provider
      value={{
        receitas,
        carregado,
        adicionarReceita,
        adicionarReceitaOficial,
        adicionarNaBiblioteca,
        removerReceita,
        toggleFavorito,
        registrarPreparacao,
        atualizarReceita,
      }}
    >
      {children}
    </ReceitasContext.Provider>
  );
}

export function useReceitas() {
  const context = useContext(ReceitasContext);

  if (!context) {
    throw new Error("useReceitas deve ser usado dentro de um ReceitasProvider");
  }

  return context;
}