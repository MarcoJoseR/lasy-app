"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { gerarId } from "@/app/utils/gerarId";

import { LISTAS_COMPRAS_INICIAIS } from "@/app/data/dadosIniciais";

export interface ItemListaCompra {
  id: string;
  texto: string;
  marcado: boolean;
}

export interface ListaCompra {
  id: string;
  receitaId: string;
  nomeReceita: string;
  itens: ItemListaCompra[];
  criadaEm: string;
  atualizadaEm: string;
}

interface ListasComprasContextType {
  listas: ListaCompra[];
  carregado: boolean;

  obterListaPorReceita: (
    receitaId: string
  ) => ListaCompra | undefined;

  obterOuCriarLista: (
    receitaId: string,
    nomeReceita: string,
    ingredientes: string[]
  ) => ListaCompra;

   recarregarListaDaReceita: (
    listaId: string,
    nomeReceita: string,
    ingredientes: string[]
  ) => void;

  toggleItem: (listaId: string, itemId: string) => void;

  atualizarItem: (
    listaId: string,
    itemId: string,
    texto: string
  ) => void;

  adicionarItem: (listaId: string, texto: string) => void;

  removerItem: (listaId: string, itemId: string) => void;

  removerListas: (ids: string[]) => void;
}

const ListasComprasContext =
  createContext<ListasComprasContextType | undefined>(undefined);

const STORAGE_KEY = "listasCompras";

export function ListasComprasProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [listas, setListas] = useState<ListaCompra[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
  try {
    const CHAVE_INICIALIZACAO_LISTAS =
      "healthListasComprasInicializadoV2";

    const jaInicializado =
      localStorage.getItem(CHAVE_INICIALIZACAO_LISTAS) === "1";

    const dadosSalvos = localStorage.getItem(STORAGE_KEY);

    const listasSalvas: ListaCompra[] = dadosSalvos
      ? JSON.parse(dadosSalvos)
      : [];

    if (!jaInicializado) {
      const receitaIdsExistentes = new Set(
        listasSalvas.map((lista) => String(lista.receitaId))
      );

      const listasIniciaisFaltantes =
        LISTAS_COMPRAS_INICIAIS.filter(
          (lista) =>
            !receitaIdsExistentes.has(String(lista.receitaId))
        );

      setListas([
        ...listasSalvas,
        ...listasIniciaisFaltantes,
      ]);

      localStorage.setItem(
        CHAVE_INICIALIZACAO_LISTAS,
        "1"
      );
    } else {
      setListas(listasSalvas);
    }
  } catch (error) {
    console.error(
      "Erro ao carregar Listas de Compras:",
      error
    );
  } finally {
    setCarregado(true);
  }
}, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listas));
    }
  }, [listas, carregado]);

function montarItens(
  ingredientes: string[]
): ItemListaCompra[] {
  return ingredientes
    .map((ingrediente) => ingrediente.trim())
    .filter((ingrediente) => ingrediente !== "")
    .map((ingrediente) => ({
      id: gerarId(),
      texto: ingrediente,
      marcado: false,
    }));
}

function obterListaPorReceita(
  receitaId: string
): ListaCompra | undefined {
  return listas.find(
    (lista) =>
      String(lista.receitaId) === String(receitaId)
  );
}

function obterOuCriarLista(
  receitaId: string,
  nomeReceita: string,
  ingredientes: string[]
): ListaCompra {
  const listaExistente = listas.find(
    (lista) =>
      String(lista.receitaId) === String(receitaId)
  );

  if (listaExistente) {
    return listaExistente;
  }

  const agora = new Date().toISOString();

  const novaLista: ListaCompra = {
    id: gerarId(),
    receitaId,
    nomeReceita,
    itens: montarItens(ingredientes),
    criadaEm: agora,
    atualizadaEm: agora,
  };

  setListas((listasAtuais) => {
    const jaExiste = listasAtuais.some(
      (lista) =>
        String(lista.receitaId) === String(receitaId)
    );

    if (jaExiste) {
      return listasAtuais;
    }

    const listasAtualizadas = [...listasAtuais, novaLista];

    const listasFinais =
      listasAtualizadas.length <= 20
        ? listasAtualizadas
        : listasAtualizadas.slice(-20);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(listasFinais)
    );

    return listasFinais;
  });

  return novaLista;
}
  
function recarregarListaDaReceita(
  listaId: string,
  nomeReceita: string,
  ingredientes: string[]
) {
  const agora = new Date().toISOString();
  const novosItens = montarItens(ingredientes);

  setListas((listasAtuais) =>
    listasAtuais.map((lista) =>
      lista.id === listaId
        ? {
            ...lista,
            nomeReceita,
            itens: novosItens,
            atualizadaEm: agora,
          }
        : lista
    )
  );
}

  function toggleItem(listaId: string, itemId: string) {
    const agora = new Date().toISOString();

    setListas((listasAtuais) =>
      listasAtuais.map((lista) =>
        lista.id === listaId
          ? {
              ...lista,
              itens: lista.itens.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      marcado: !item.marcado,
                    }
                  : item
              ),
              atualizadoEm: agora,
            }
          : lista
      )
    );
  }

  function atualizarItem(
    listaId: string,
    itemId: string,
    texto: string
  ) {
    const agora = new Date().toISOString();

    setListas((listasAtuais) =>
      listasAtuais.map((lista) =>
        lista.id === listaId
          ? {
              ...lista,
              itens: lista.itens.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      texto,
                    }
                  : item
              ),
              atualizadoEm: agora,
            }
          : lista
      )
    );
  }

  function adicionarItem(listaId: string, texto: string) {
    const textoLimpo = texto.trim();

    if (!textoLimpo) {
      return;
    }

    const agora = new Date().toISOString();

    const novoItem: ItemListaCompra = {
      id: gerarId(),
      texto: textoLimpo,
      marcado: false,
    };

    setListas((listasAtuais) =>
      listasAtuais.map((lista) =>
        lista.id === listaId
          ? {
              ...lista,
              itens: [...lista.itens, novoItem],
              atualizadoEm: agora,
            }
          : lista
      )
    );
  }

  function removerItem(listaId: string, itemId: string) {
    const agora = new Date().toISOString();

    setListas((listasAtuais) =>
      listasAtuais.map((lista) =>
        lista.id === listaId
          ? {
              ...lista,
              itens: lista.itens.filter(
                (item) => item.id !== itemId
              ),
              atualizadoEm: agora,
            }
          : lista
      )
    );
  }

  function removerListas(ids: string[]) {
    if (ids.length === 0) {
      return;
    }

    setListas((listasAtuais) =>
      listasAtuais.filter((lista) => !ids.includes(lista.id))
    );
  }

  return (
    <ListasComprasContext.Provider
      value={{
        listas,
        carregado,
        obterListaPorReceita,
        obterOuCriarLista,
        recarregarListaDaReceita,
        toggleItem,
        atualizarItem,
        adicionarItem,
        removerItem,
        removerListas,
      }}
    >
      {children}
    </ListasComprasContext.Provider>
  );
}

export function useListasCompras() {
  const context = useContext(ListasComprasContext);

  if (!context) {
    throw new Error(
      "useListasCompras deve ser usado dentro de um ListasComprasProvider"
    );
  }

  return context;
}