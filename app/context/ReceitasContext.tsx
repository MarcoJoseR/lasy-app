"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { gerarId } from "@/app/utils/gerarId";

import { RECEITAS_INICIAIS } from "@/app/data/dadosIniciais";

import {
  salvarCapaReceita,
  obterImagensCarrossel,
  salvarImagensCarrossel,
} from "@/app/utils/carrosselIndexedDB";

import { inicializarPacoteUsuarios } from "@/app/utils/inicializarPacoteUsuarios";

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
  chaveImagemCapa?: string;
  posicaoImagemY?: number;
  video?: string;
  tipoConteudo?: "receita" | "carrossel";

  carrossel?: {
    imagens: string[];
    titulo?: string;
    origemUrl?: string;
    chaveImagens?: string;
    quantidadeImagens?: number;
  };

  printsLegenda?: string[];
  chavePrintsLegenda?: string;
  quantidadePrintsLegenda?: number;

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

  adicionarReceita: (
    receita: Omit<
      Receita,
      "id" | "tipo" | "criadoEm" | "atualizadoEm"
    >
  ) => boolean;

  adicionarReceitaOficial: (
    receita: Omit<
      Receita,
      "id" | "tipo" | "criadoEm" | "atualizadoEm"
    >
  ) => boolean;

  adicionarReceitasOficiaisEmLote: (
  receitas: Omit<
    Receita,
    "tipo" | "criadoEm" | "atualizadoEm"
  >[]
) => boolean;

  adicionarNaBiblioteca: (receita: Receita) => Promise<Receita>;
  
  removerReceita: (id: string) => boolean;
  toggleFavorito: (id: string) => void;
  registrarPreparacao: (id: string) => boolean;

  atualizarReceita: (
    id: string,
    dadosAtualizados: Partial<Omit<Receita, "id" | "criadoEm">>
  ) => boolean;
}

const ReceitasContext = createContext<ReceitasContextType | undefined>(
  undefined
);

const STORAGE_KEY = "minhaBiblioteca";

function persistirAlteracaoReceitas(
  alterar: (receitasAtuais: Receita[]) => Receita[]
): Receita[] {
  const dadosSalvos = localStorage.getItem(STORAGE_KEY);

  if (dadosSalvos === null) {
    throw new Error(
      "Minha Biblioteca não está disponível. Gravação bloqueada."
    );
  }

  const dadosInterpretados: unknown = JSON.parse(dadosSalvos);

  if (
    !Array.isArray(dadosInterpretados) ||
    !dadosInterpretados.every(
      (receita) =>
        receita !== null &&
        typeof receita === "object" &&
        !Array.isArray(receita) &&
        typeof receita.id === "string" &&
        typeof receita.nome === "string"
    )
  ) {
    throw new Error(
      "Minha Biblioteca contém dados inválidos. Gravação bloqueada."
    );
  }

  const receitasAtualizadas = alterar(
    dadosInterpretados as Receita[]
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(receitasAtualizadas)
  );

  return receitasAtualizadas;
}

export function ReceitasProvider({ children }: { children: ReactNode }) {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [carregado, setCarregado] = useState(false);


useEffect(() => {
  async function carregarEMigrarReceitas() {
    const CHAVE_INICIALIZACAO = "healthReceitasInicializadoV1";

    try {
      const dadosSalvos = localStorage.getItem(STORAGE_KEY);
      const jaInicializado =
        localStorage.getItem(CHAVE_INICIALIZACAO) === "1";

      let receitasParaCarregar: Receita[];

      if (dadosSalvos !== null) {
        // A biblioteca existente tem prioridade sobre o pacote inicial.
        const dadosInterpretados: unknown = JSON.parse(dadosSalvos);

        if (
          !Array.isArray(dadosInterpretados) ||
          !dadosInterpretados.every(
            (receita) =>
              receita !== null &&
              typeof receita === "object" &&
              !Array.isArray(receita) &&
              typeof receita.id === "string" &&
              typeof receita.nome === "string"
          )
        ) {
          throw new Error(
            "Minha Biblioteca contém dados inválidos. Gravação bloqueada."
          );
        }

        receitasParaCarregar = dadosInterpretados as Receita[];

        if (!jaInicializado) {
          localStorage.setItem(CHAVE_INICIALIZACAO, "1");
        }
      } else if (jaInicializado) {
        // Ausência inesperada em instalação já inicializada.
        // Não recriar uma biblioteca vazia nem reinstalar o pacote.
        throw new Error(
          "Minha Biblioteca ausente em instalação já inicializada."
        );
      } else {
        // Instalação nova, sem biblioteca e sem inicialização anterior.
        const resultadoPacote = await inicializarPacoteUsuarios();

        receitasParaCarregar = resultadoPacote.receitas;

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(receitasParaCarregar)
        );

        localStorage.setItem(CHAVE_INICIALIZACAO, "1");

        console.log("Pacote inicial de usuários carregado.");
      }

      // Migração das capas antigas para IndexedDB.
      let quantidadeMigrada = 0;
      const receitasMigradas: Receita[] = [];

      for (const receita of receitasParaCarregar) {
        if (
          receita.imagem &&
          receita.imagem.startsWith("data:image/")
        ) {
          await salvarCapaReceita(receita.id, receita.imagem);

          const { imagem, ...receitaSemImagem } = receita;

          receitasMigradas.push({
            ...receitaSemImagem,
            chaveImagemCapa: receita.id,
          });

          quantidadeMigrada++;
        } else {
          receitasMigradas.push(receita);
        }
      }

      if (quantidadeMigrada > 0) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(receitasMigradas)
        );

        console.log(
          "Capas migradas para IndexedDB:",
          quantidadeMigrada
        );
      }

      setReceitas(receitasMigradas);
      setCarregado(true);
    } catch (error) {
      console.error(
        "Erro ao carregar ou inicializar receitas. Gravações bloqueadas:",
        error
      );
      // Mantém carregado=false para impedir gravações automáticas.
    }
  }

  carregarEMigrarReceitas();
}, []);


useEffect(() => {
  if (!carregado) return;

  function recarregarReceitas() {
    try {
      const dadosSalvos = localStorage.getItem(STORAGE_KEY);

      if (dadosSalvos === null) {
        console.error(
          "Minha Biblioteca ausente. Atualização automática bloqueada."
        );
        return;
      }

      const dadosInterpretados: unknown = JSON.parse(dadosSalvos);

      if (
        !Array.isArray(dadosInterpretados) ||
        !dadosInterpretados.every(
          (receita) =>
            receita !== null &&
            typeof receita === "object" &&
            !Array.isArray(receita) &&
            typeof receita.id === "string" &&
            typeof receita.nome === "string"
        )
      ) {
        console.error(
          "Minha Biblioteca inválida. Atualização automática bloqueada."
        );
        return;
      }

      const receitasSalvas = dadosInterpretados as Receita[];

      setReceitas((receitasAtuais) => {
        if (
          receitasAtuais.length > 0 &&
          receitasSalvas.length === 0
        ) {
          console.error(
            "Biblioteca inesperadamente vazia. Atualização automática bloqueada."
          );
          return receitasAtuais;
        }

        return receitasSalvas;
      });
    } catch (error) {
      console.error(
        "Erro ao atualizar receitas. Dados atuais preservados:",
        error
      );
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
  receita: Omit<
    Receita,
    "id" | "tipo" | "criadoEm" | "atualizadoEm"
  >
): boolean {
  if (!carregado) {
    window.alert(
      "Não foi possível acessar sua biblioteca. " +
      "A receita não foi salva para proteger seus dados."
    );
    return false;
  }

  const agora = new Date().toISOString();
  const novaReceita: Receita = {
    ...receita,
    id: gerarId(),
    tipo: "pessoal",
    criadoEm: agora,
    atualizadoEm: agora,
  };

  try {
    const receitasAtualizadas = persistirAlteracaoReceitas(
      (receitasAtuais) => [
        ...receitasAtuais,
        novaReceita,
      ]
    );

    setReceitas(receitasAtualizadas);

    return true;
  } catch (error) {
    console.error(
      "Erro ao salvar receita no armazenamento local:",
      error
    );

    window.alert(
      "Não foi possível salvar a receita. As imagens podem estar ocupando mais espaço do que o disponível. Tente reduzir a quantidade de imagens."
    );

    return false;
  }
}

function adicionarReceitaOficial(
  receita: Omit<Receita, "id" | "tipo" | "criadoEm" | "atualizadoEm">
): boolean {
  if (!carregado) {
    window.alert(
      "Não foi possível acessar a biblioteca. " +
      "O cadastro foi bloqueado para proteger seus dados."
    );
    return false;
  }

  const agora = new Date().toISOString();

  const novaReceita: Receita = {
    ...receita,
    id: crypto.randomUUID(),
    tipo: "oficial",
    criadoEm: agora,
    atualizadoEm: agora,
  };

  try {
    const receitasAtualizadas = persistirAlteracaoReceitas(
      (receitasAtuais) => [
        ...receitasAtuais,
        novaReceita,
      ]
    );

    setReceitas(receitasAtualizadas);
    return true;
  } catch (error) {
    console.error("Erro ao adicionar receita oficial:", error);

    window.alert(
      "Não foi possível salvar a receita oficial. " +
      "A operação foi interrompida para proteger seus dados."
    );

    return false;
  }
}

function adicionarReceitasOficiaisEmLote(
  receitasParaImportar: Omit<
    Receita,
    "tipo" | "criadoEm" | "atualizadoEm"
  >[]
): boolean {

  if (!carregado) {
    window.alert(
      "Não foi possível acessar a biblioteca. " +
      "A importação foi bloqueada para proteger seus dados."
    );
    return false;
  }

  if (receitasParaImportar.length === 0) {
    return false;
  }

  const agora = new Date().toISOString();

  const novasReceitas: Receita[] = receitasParaImportar.map(
    (receita) => ({
      ...receita,
      id: receita.id,
      tipo: "oficial",
      colecaoInicial: false,
      favorito: false,
      criadoEm: agora,
      atualizadoEm: agora,
    })
  );

  try {
    const receitasAtualizadas = persistirAlteracaoReceitas(
      (receitasAtuais) => {
        const idsImportados = new Set(
          novasReceitas.map((receita) => receita.id)
        );

        const receitasSemDuplicadas = receitasAtuais.filter(
          (receita) => !idsImportados.has(receita.id)
        );

        return [
          ...receitasSemDuplicadas,
          ...novasReceitas,
        ];
      }
    );

    setReceitas(receitasAtualizadas);

    return true;
  } catch (error) {
    console.error(
      "Erro ao importar receitas para a Biblioteca Oficial:",
      error
    );

    window.alert(
      "Não foi possível importar as receitas selecionadas."
    );

    return false;
  }
}

async function adicionarNaBiblioteca(
  receita: Receita
): Promise<Receita> {
  if (!carregado) {
    throw new Error(
      "Biblioteca não carregada. Operação bloqueada para proteger seus dados."
    );
  }

  const agora = new Date().toISOString();

  const novaReceitaId = crypto.randomUUID();

  let carrosselCopia = receita.carrossel;

  // ========================================================
  // CRIAR CÓPIA INDEPENDENTE DAS IMAGENS DO CARROSSEL
  // ========================================================

  if (receita.tipoConteudo === "carrossel") {
    const chaveOriginal =
      receita.carrossel?.chaveImagens || "";

    let imagensParaCopiar: string[] = [];

    try {
      if (chaveOriginal) {
        imagensParaCopiar =
          await obterImagensCarrossel(chaveOriginal);
      } else if (
        Array.isArray(receita.carrossel?.imagens)
      ) {
        imagensParaCopiar =
          receita.carrossel.imagens;
      }

      if (imagensParaCopiar.length > 0) {
        await salvarImagensCarrossel(
          novaReceitaId,
          imagensParaCopiar
        );
      }
    } catch (erro) {
      console.error(
        "Erro ao copiar imagens do carrossel para Minha Biblioteca:",
        erro
      );

      throw erro;
    }

    carrosselCopia = {
      ...receita.carrossel,
      imagens: [],
      chaveImagens: novaReceitaId,
      quantidadeImagens: imagensParaCopiar.length,
    };
  }

  const novaReceita: Receita = {
    ...receita,
    id: novaReceitaId,
    tipo: "pessoal",
    colecaoInicial: false,
    favorito: false,

    ...(receita.tipoConteudo === "carrossel"
      ? {
          carrossel: carrosselCopia,
        }
      : {}),

    criadoEm: agora,
    atualizadoEm: agora,
  };

  const receitasAtualizadas = persistirAlteracaoReceitas(
    (receitasAtuais) => [
      ...receitasAtuais,
      novaReceita,
    ]
  );

  setReceitas(receitasAtualizadas);

  return novaReceita;
}

  function removerReceita(id: string): boolean {
    if (!carregado) return false;

    try {
      const receitasAtualizadas = persistirAlteracaoReceitas(
        (receitasAtuais) => {
          if (!receitasAtuais.some((receita) => receita.id === id)) {
            throw new Error("Receita não encontrada na biblioteca.");
          }

          return receitasAtuais.filter(
            (receita) => receita.id !== id
          );
        }
      );

      setReceitas(receitasAtualizadas);
      return true;
    } catch (error) {
      console.error("Erro ao remover receita:", error);

      window.alert(
        "Não foi possível remover a receita. " +
        "A operação foi interrompida para proteger seus dados."
      );

      return false;
    }
  }

  function registrarPreparacao(id: string): boolean {
    if (!carregado) return false;

    const agora = new Date().toISOString();

    try {
      const receitasAtualizadas = persistirAlteracaoReceitas(
        (receitasAtuais) => {
          if (!receitasAtuais.some((receita) => receita.id === id)) {
            throw new Error("Receita não encontrada na biblioteca.");
          }

          return receitasAtuais.map((receita) =>
            receita.id === id
              ? {
                  ...receita,
                  preparacoes: [
                    ...(receita.preparacoes || []),
                    agora,
                  ],
                }
              : receita
          );
        }
      );

      setReceitas(receitasAtualizadas);
      return true;
    } catch (error) {
      console.error("Erro ao registrar preparação:", error);

      window.alert(
        "Não foi possível registrar a preparação. " +
        "A operação foi interrompida para proteger seus dados."
      );

      return false;
    }
  }

  function toggleFavorito(id: string) {
    if (!carregado) return;

    const agora = new Date().toISOString();

    try {
      const receitasAtualizadas = persistirAlteracaoReceitas(
        (receitasAtuais) => {
          if (!receitasAtuais.some((receita) => receita.id === id)) {
            throw new Error("Receita não encontrada na biblioteca.");
          }

          return receitasAtuais.map((receita) =>
            receita.id === id
              ? {
                  ...receita,
                  favorito: !receita.favorito,
                  atualizadoEm: agora,
                }
              : receita
          );
        }
      );

      setReceitas(receitasAtualizadas);
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);

      window.alert(
        "Não foi possível alterar o favorito. " +
        "A operação foi interrompida para proteger seus dados."
      );
    }
  }

  function atualizarReceita(
    id: string,
    dadosAtualizados: Partial<Omit<Receita, "id" | "criadoEm">>
  ): boolean {
    if (!carregado) return false;

    const agora = new Date().toISOString();

    try {
      const receitasAtualizadas = persistirAlteracaoReceitas(
        (receitasAtuais) => {
          if (!receitasAtuais.some((receita) => receita.id === id)) {
            throw new Error("Receita não encontrada na biblioteca.");
          }

          return receitasAtuais.map((receita) =>
            receita.id === id
              ? {
                  ...receita,
                  ...dadosAtualizados,
                  atualizadoEm: agora,
                }
              : receita
          );
        }
      );

      setReceitas(receitasAtualizadas);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);

      window.alert(
        "Não foi possível salvar as alterações da receita. " +
        "A operação foi interrompida para proteger seus dados."
      );

      return false;
    }
  }

  return (
    <ReceitasContext.Provider
      value={{
        receitas,
        carregado,
        adicionarReceita,
        adicionarReceitaOficial,
        adicionarReceitasOficiaisEmLote,
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