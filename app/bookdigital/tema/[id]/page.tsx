"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type {
  ItemBiblioteca,
  Tema,
} from "@/types/bookdigital";

import {
  listarTemas,
} from "@/app/lib/bookdigital-temas";

import {
  atualizarItem,
  criarItem,
  listarItensPorTema,
  moverItemParaTema,
  removerItem,
  toggleFavoritoItem,
} from "@/app/lib/bookdigital-itens";

import {
  obterImagemCapa,
  obterImagensItem,
  salvarImagemCapa,
  salvarImagensItem,
} from "@/app/lib/bookdigital-imagens";

import { reduzirImagem } from "@/app/lib/bookdigital-reduzir-imagem";

import {
  salvarDocumento,
  obterDocumento,
} from "@/app/lib/bookdigital-arquivos";

import {
  adicionarLinkNaLista,
  atualizarLinkNaLista,
  removerLinkDaLista,
} from "@/app/lib/bookdigital-links";

import {
  filtrarItensBookDigital,
  ordenarItensBookDigital,
} from "@/app/lib/bookdigital-filtros";

import {
  podeAdicionarImagens,
  removerImagemDaLista,
  moverImagemNaLista,
} from "@/app/lib/bookdigital-imagens-item";

import {
  prepararDadosFormularioItem,
} from "@/app/lib/bookdigital-formulario-item";

import {
  carregarImagensItemParaEdicao,
} from "@/app/lib/bookdigital-carregar-imagens-item";

import {
  carregarDocumentosItemParaEdicao,
} from "@/app/lib/bookdigital-carregar-documentos-item";

import {
  carregarCapaItemParaEdicao,
} from "@/app/lib/bookdigital-carregar-capa-item";

export default function TemaPage() {
  const params = useParams();
  const router = useRouter();

  const temaId = Array.isArray(params.id)
    ? params.id[0]
    : String(params.id ?? "");

  const [tema, setTema] = useState<Tema | null>(null);
  const [itens, setItens] = useState<ItemBiblioteca[]>([]);
  const [busca, setBusca] = useState("");
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  const [somenteComVideo, setSomenteComVideo] = useState(false);
  const [somenteComDocumentos, setSomenteComDocumentos] = useState(false);
  const [somenteComImagens, setSomenteComImagens] = useState(false);

  const itensFiltrados =
  filtrarItensBookDigital(itens, {
    busca,
    somenteFavoritos,
    somenteComVideo,
    somenteComDocumentos,
    somenteComImagens,
  });

  const [carregando, setCarregando] = useState(true);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [palavrasChave, setPalavrasChave] = useState("");
  const [origem, setOrigem] = useState("");
  const [video, setVideo] = useState("");
  const [erro, setErro] = useState("");

  const [imagemCapa, setImagemCapa] =
    useState<string>("");

  const [capas, setCapas] =
    useState<Record<string, string>>({});

  const [posicaoImagemY, setPosicaoImagemY] =
    useState(50);

  const [imagemCapaAtual, setImagemCapaAtual] =
    useState<string>("");

  const [imagensItem, setImagensItem] =
    useState<string[]>([]);

  const [chaveImagens, setChaveImagens] =
    useState("");

  const [documentos, setDocumentos] =
  useState<File[]>([]);
  
  const [itemEditandoId, setItemEditandoId] =
    useState<string | null>(null);

  const [temaDestinoId, setTemaDestinoId] = useState("");
  const [todosTemas, setTodosTemas] = useState<Tema[]>([]);

  const [links, setLinks] = useState<string[]>([""]);

  const [ordenacao, setOrdenacao] = useState<
    "recentes" | "antigos" | "titulo"
  >("recentes");

function iniciarNovoItem() {
  setItemEditandoId(null);

  setTitulo("");
  setDescricao("");
  setPalavrasChave("");
  setOrigem("");
  setVideo("");
  setLinks([""]);

  setImagemCapa("");
  setImagemCapaAtual("");
  setPosicaoImagemY(50);

  setImagensItem([]);
  setChaveImagens("");

  setDocumentos([]);

  setTemaDestinoId(temaId);

  setErro("");
  setMostrarFormulario(true);
}
   
  function limparFormularioItem() {
  setTitulo("");
  setDescricao("");
  setPalavrasChave("");
  setOrigem("");
  setVideo("");
  setLinks([""]);

  setImagemCapa("");
  setImagemCapaAtual("");
  setPosicaoImagemY(50);

  setImagensItem([]);
  setChaveImagens("");

  setDocumentos([]);

  setTemaDestinoId("");
  setItemEditandoId(null);

  setErro("");
}
  
  function adicionarLink() {
  setLinks((anteriores) =>
    adicionarLinkNaLista(anteriores)
  );
}

function atualizarLink(
  indice: number,
  valor: string
) {
  setLinks((anteriores) =>
    atualizarLinkNaLista(
      anteriores,
      indice,
      valor
    )
  );
}

function removerLink(indice: number) {
  setLinks((anteriores) =>
    removerLinkDaLista(
      anteriores,
      indice
    )
  );
}
 
async function selecionarImagensItem(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const arquivos = Array.from(
    event.target.files || []
  );

  if (arquivos.length === 0) {
    return;
  }

  if (
  !podeAdicionarImagens(
    imagensItem.length,
    arquivos.length
  )
) {
    window.alert(
      "O item pode ter no máximo 20 imagens."
    );

    event.target.value = "";
    return;
  }

  try {
    const novasImagens =
      await Promise.all(
        arquivos.map((arquivo) =>
          reduzirImagem(arquivo)
        )
      );

    setImagensItem((atuais) => [
      ...atuais,
      ...novasImagens,
    ]);

    event.target.value = "";
  } catch (erro) {
    console.error(
      "Erro ao preparar imagens do item:",
      erro
    );

    window.alert(
      "Não foi possível preparar uma ou mais imagens."
    );
  }
}

function removerImagemItem(
  indice: number
) {
  setImagensItem((atuais) =>
    removerImagemDaLista(
      atuais,
      indice
    )
  );
}

function moverImagemItem(
  indice: number,
  direcao: "esquerda" | "direita"
) {
  setImagensItem((atuais) =>
    moverImagemNaLista(
      atuais,
      indice,
      direcao
    )
  );
}

  useEffect(() => {
       
    const temas = listarTemas();
      setTodosTemas(temas);

    const temaEncontrado = temas.find(
      (item) => item.id === temaId
    );

    setTema(temaEncontrado ?? null);

    if (temaEncontrado) {
      const itensDoTema =
        listarItensPorTema(temaId);

      setItens(itensDoTema);
      carregarCapas(itensDoTema);
    }

    setCarregando(false);
  }, [temaId]);

async function carregarCapas(
  listaItens: ItemBiblioteca[]
) {
  const novasCapas: Record<string, string> = {};

  await Promise.all(
    listaItens.map(async (item) => {
      if (!item.chaveImagemCapa) {
        return;
      }

      try {
        const imagem = await obterImagemCapa(
          item.chaveImagemCapa
        );

        if (imagem) {
          novasCapas[item.id] = imagem;
        }
      } catch (error) {
        console.error(
          "Erro ao carregar capa:",
          error
        );
      }
    })
  );

  setCapas(novasCapas);
}

  async function adicionarItem() {
    try {
      setErro("");

      const dadosFormulario =
        prepararDadosFormularioItem({
          titulo,
          descricao,
          palavrasChave,
          origem,
          video,
          links,
        });

      if (!dadosFormulario.titulo) {
        setErro("Informe um título para o item.");
        return;
      }

        let chaveImagemCapa: string | undefined;

        if (imagemCapa) {
          chaveImagemCapa = crypto.randomUUID();

          await salvarImagemCapa(
            chaveImagemCapa,
            imagemCapa
          );
        }

      let chaveImagensFinal: string | undefined;

      if (imagensItem.length > 0) {
        chaveImagensFinal = crypto.randomUUID();

        await salvarImagensItem(
          chaveImagensFinal,
          imagensItem
        );
      }

    const documentosSalvos: {
      chaveDocumento: string;
      nomeDocumento: string;
      tipoDocumento?: string;
    }[] = [];

for (const arquivo of documentos) {
  const chaveDocumento =
    crypto.randomUUID();

  await salvarDocumento(
    chaveDocumento,
    arquivo
  );

  documentosSalvos.push({
    chaveDocumento,
    nomeDocumento: arquivo.name,
    tipoDocumento:
      arquivo.type || undefined,
  });
}

      const novoItem = criarItem({
        temaId,
        titulo: dadosFormulario.titulo,
        descricao: dadosFormulario.descricao,
        palavrasChave: dadosFormulario.palavrasChave,
        origem: dadosFormulario.origem,
        video: dadosFormulario.video,
        links: dadosFormulario.links,
        chaveImagemCapa,
        posicaoImagemY,
        favorito: false,
        chaveImagens: chaveImagensFinal,
        quantidadeImagens:
          imagensItem.length > 0
            ? imagensItem.length
            : undefined,
            documentos:
        documentosSalvos.length > 0
          ? documentosSalvos
          : undefined,
      });

      setItens((anteriores) => [
        ...anteriores,
        novoItem,
      ]);

      if (imagemCapa) {
        setCapas((anteriores) => ({
          ...anteriores,
          [novoItem.id]: imagemCapa,
        }));   
        
      }

      setTitulo("");
      setDescricao("");
      setPalavrasChave("");
      setImagensItem([]);
      setChaveImagens("");
      setOrigem("");
      setVideo("");
      setDocumentos([]);
      setMostrarFormulario(false);
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      }
    }
  }

function alternarFavorito(itemId: string) {
  try {
    const itemAtualizado =
      toggleFavoritoItem(itemId);

    setItens((anteriores) =>
      anteriores.map((item) =>
        item.id === itemId
          ? itemAtualizado
          : item
      )
    );
  } catch (error) {
    console.error(
      "Erro ao alterar favorito:",
      error
    );
  }
}

function iniciarEdicao(item: ItemBiblioteca) {
  setItemEditandoId(item.id);

  setTitulo(item.titulo);
  setDescricao(item.descricao ?? "");
  setPalavrasChave(
    item.palavrasChave.join(", ")
  );
  setOrigem(item.origem ?? "");
  setVideo(item.video ?? "");
  setLinks(
  item.links && item.links.length > 0
    ? item.links.slice(0, 5)
    : [""]
);
  setTemaDestinoId(item.temaId);

  setImagemCapa("");

const dadosCapa =
  carregarCapaItemParaEdicao(
    item,
    capas
  );

setImagemCapaAtual(
  dadosCapa.imagemCapaAtual
);

setPosicaoImagemY(
  dadosCapa.posicaoImagemY
);

  setImagensItem([]);

  setChaveImagens(
    item.chaveImagens ?? ""
  );

  carregarImagensItemParaEdicao(
    item.chaveImagens
  ).then((imagens) => {
    setImagensItem(imagens);
  });

  setDocumentos([]);

  carregarDocumentosItemParaEdicao(
    item.documentos
  ).then((arquivos) => {
    setDocumentos(arquivos);
  });
      
  
    setMostrarFormulario(true);
    setErro("");
}

async function salvarDadosEdicaoAtual() {
  if (!itemEditandoId) {
    return false;
  }

  const dadosFormulario =
    prepararDadosFormularioItem({
      titulo,
      descricao,
      palavrasChave,
      origem,
      video,
      links,
    });

  if (!dadosFormulario.titulo) {
    setErro("Informe um título para o item.");
    return false;
  }

  const itemAtual =
    itens.find(
      (item) => item.id === itemEditandoId
    );

  let chaveImagemCapa =
    itemAtual?.chaveImagemCapa;

  if (imagemCapa) {
    if (!chaveImagemCapa) {
      chaveImagemCapa =
        crypto.randomUUID();
    }

    await salvarImagemCapa(
      chaveImagemCapa,
      imagemCapa
    );
  }

  let chaveImagensFinal =
    chaveImagens || undefined;

  if (imagensItem.length > 0) {
    if (!chaveImagensFinal) {
      chaveImagensFinal =
        crypto.randomUUID();
    }

    await salvarImagensItem(
      chaveImagensFinal,
      imagensItem
    );
  }

  const documentosFinais: {
    chaveDocumento: string;
    nomeDocumento: string;
    tipoDocumento?: string;
  }[] = [];

  for (const arquivo of documentos) {
    const chaveDocumento =
      crypto.randomUUID();

    await salvarDocumento(
      chaveDocumento,
      arquivo
    );

    documentosFinais.push({
      chaveDocumento,
      nomeDocumento: arquivo.name,
      tipoDocumento:
        arquivo.type || undefined,
    });
  }

  const itemAtualizado = atualizarItem(
    itemEditandoId,
    {

      titulo: dadosFormulario.titulo,
      descricao: dadosFormulario.descricao,
      palavrasChave:
        dadosFormulario.palavrasChave,
      origem: dadosFormulario.origem,
      video: dadosFormulario.video,
      links: dadosFormulario.links,

      chaveImagemCapa,
      posicaoImagemY,

      chaveImagens:
        imagensItem.length > 0
          ? chaveImagensFinal
          : undefined,

      quantidadeImagens:
        imagensItem.length > 0
          ? imagensItem.length
          : undefined,

      documentos:
        documentosFinais.length > 0
          ? documentosFinais
          : undefined,
    }
  );

  setItens((anteriores) =>
    anteriores.map((item) =>
      item.id === itemEditandoId
        ? itemAtualizado
        : item
    )
  );

  if (imagemCapa) {
    setCapas((anteriores) => ({
      ...anteriores,
      [itemEditandoId]: imagemCapa,
    }));
  }

  return true;
}

async function salvarEdicao() {
  const salvou =
    await salvarDadosEdicaoAtual();

  if (!salvou) {
    return false;
  }

  limparFormularioItem();
  setMostrarFormulario(false);

  return true;
}

function excluirItem(itemId: string) {
  const confirmar = window.confirm(
    "Deseja realmente excluir este item?"
  );

  if (!confirmar) {
    return;
  }

  removerItem(itemId);

  setItens((anteriores) =>
    anteriores.filter(
      (item) => item.id !== itemId
    )
  );
}

  async function moverItem() {
  if (!itemEditandoId) {
    return;
  }

  if (!temaDestinoId) {
    return;
  }

  if (temaDestinoId === temaId) {
    return;
  }

  const salvou =
    await salvarDadosEdicaoAtual();

  if (!salvou) {
    return;
  }

  moverItemParaTema(
    itemEditandoId,
    temaDestinoId
  );

  setItens((anteriores) =>
    anteriores.filter(
      (item) => item.id !== itemEditandoId
    )
  );

  limparFormularioItem();
  setMostrarFormulario(false);
}

const itensOrdenados =
  ordenarItensBookDigital(
    itensFiltrados,
    ordenacao
  );

  if (carregando) {

    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-sm text-zinc-400">
            Carregando tema...
          </p>
        </div>
      </main>
    );
  }

  if (!tema) {

  function alternarFavorito(itemId: string) {
    try {
      const itemAtualizado =
        toggleFavoritoItem(itemId);

      setItens((anteriores) =>
        anteriores.map((item) =>
          item.id === itemId
            ? itemAtualizado
            : item
        )
      );
    } catch (error) {
      console.error(
        "Erro ao alterar favorito:",
        error
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">
          Tema não encontrado
        </h1>

        <button
          type="button"
          onClick={() => router.push("/bookdigital")}
          className="mt-6 rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold text-white"
        >
          Voltar ao BookDigital
        </button>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          type="button"
          onClick={() => {
            if (itemEditandoId) {
              router.push(`/bookdigital/item/${itemEditandoId}`);
              return;
            }

            router.push("/bookdigital");
          }}
          className="mb-6 text-sm text-zinc-400 hover:text-white"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-bold">
          {tema.nome}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Biblioteca do tema
        </p>

        <button
          type="button"
          onClick={() => {
            if (mostrarFormulario) {
              setMostrarFormulario(false);
            } else {
              iniciarNovoItem();
            }
          }}
          className="mt-6 rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold text-white"
        >
          {mostrarFormulario
            ? "Cancelar"
            : "+ Novo item"}
        </button>

        {mostrarFormulario && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-lg font-semibold">
              {itemEditandoId
                ? "Editar item"
                : "Novo item"}
            </h2>

            <label className="mt-4 block text-sm font-medium">
              Título
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Como configurar uma impressora"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
            />

            <label className="mt-4 block text-sm font-medium">
              Descrição
            </label>

            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo do conteúdo"
              rows={4}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-base font-medium text-black"
            />

            <label className="mt-4 block text-sm font-medium">
              Palavras-chave
            </label>

            <input
              type="text"
              value={palavrasChave}
              onChange={(e) =>
                setPalavrasChave(e.target.value)
              }
              placeholder="Ex.: impressora, Windows, configuração"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-base font-medium text-black"
            />

            <p className="mt-1 text-xs text-zinc-400">
              Separe as palavras por vírgulas.
            </p>

            <label className="mt-4 block text-sm font-medium">
              Link de origem
            </label>

            <input
              type="url"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
            />

            <label className="mt-4 block text-sm font-medium">
              Link do vídeo
            </label>

            <input
              type="url"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
            />

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-300">
            Links externos
          </h3>

          <p className="mt-1 text-xs text-zinc-400">
            Até 5 links externos
          </p>
        </div>

        {links.map((link, indice) => (
          <div
            key={indice}
            className="flex gap-2"
          >
            <input
              type="url"
              value={link}
              onChange={(e) =>
                atualizarLink(indice, e.target.value)
              }
              placeholder={`Link externo ${indice + 1}`}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white"
            />

            {links.length > 1 && (
              <button
                type="button"
                onClick={() => removerLink(indice)}
                className="rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:bg-zinc-800"
                title="Remover link"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {links.length < 5 && (
          <button
            type="button"
            onClick={adicionarLink}
            className="text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            + Adicionar link
          </button>
        )}
      </div>

            <label className="mt-4 block text-sm font-medium">
              Imagem de capa
            </label>

            <div className="mt-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              {imagemCapa || imagemCapaAtual ? (
                <img
                  src={imagemCapa || imagemCapaAtual}
                  alt="Prévia da capa"
                  className="h-44 w-full object-cover"
                  style={{
                    objectPosition: `center ${posicaoImagemY}%`,
                  }}
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center text-sm text-zinc-600">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium">
                Ajuste vertical da capa
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={posicaoImagemY}
                onChange={(e) =>
                  setPosicaoImagemY(
                    Number(e.target.value)
                  )
                }
                className="mt-2 w-full"
              />

              <p className="mt-1 text-xs text-zinc-400">
                Posição: {posicaoImagemY}%
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];

                if (!file) {
                  return;
                }

                try {
                  const imagemReduzida =
                    await reduzirImagem(file);

                  setImagemCapa(imagemReduzida);
                } catch (error) {
                  console.error(
                    "Erro ao preparar imagem:",
                    error
                  );

                  setErro(
                    "Não foi possível preparar a imagem."
                  );
                }
              }}
              className="mt-2 block w-full text-sm text-zinc-300"
            />

            {erro && (
              <p className="mt-3 text-sm text-red-400">
                {erro}
              </p>
            )}

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="font-semibold text-white">
                Imagens do item
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Selecione até 20 imagens.
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={selecionarImagensItem}
                className="mt-3 block w-full rounded-lg bg-zinc-800 p-3"
              />

              <p className="mt-2 text-xs text-zinc-400">
                {imagensItem.length}/20 imagens
              </p>

              {imagensItem.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {imagensItem.map(
                    (imagem, indice) => (
                      <div
                        key={`${indice}-${imagem}`}
                        className="relative overflow-hidden rounded-lg bg-zinc-800"
                      >
                        <img
                          src={imagem}
                          alt={`Imagem ${indice + 1}`}
                          className="aspect-square w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removerImagemItem(indice)
                          }
                          className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-lg font-bold text-white shadow hover:bg-red-700"
                          title="Retirar imagem"
                        >
                          ×
                        </button>

                        <div className="p-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                moverImagemItem(
                                  indice,
                                  "esquerda"
                                )
                              }
                              disabled={indice === 0}
                              className="rounded bg-zinc-700 px-2 py-1 text-sm text-white disabled:opacity-30"
                            >
                              ←
                            </button>

                            <span className="text-xs text-zinc-300">
                              {indice + 1}/
                              {imagensItem.length}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                moverImagemItem(
                                  indice,
                                  "direita"
                                )
                              }
                              disabled={
                                indice ===
                                imagensItem.length - 1
                              }
                              className="rounded bg-zinc-700 px-2 py-1 text-sm text-white disabled:opacity-30"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="font-semibold text-white">
                Documentos
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Anexe até 3 documentos ao item.
              </p>

              <input
                type="file"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];

                  if (!arquivo) {
                    return;
                  }

                  if (documentos.length >= 3) {
                    alert("É possível anexar no máximo 3 documentos.");
                    e.currentTarget.value = "";
                    return;
                  }

                  setDocumentos((anteriores) => [
                    ...anteriores,
                    arquivo,
                  ]);

                  e.currentTarget.value = "";
                }}
                className="mt-3 block w-full rounded-lg bg-zinc-800 p-3"
              />

              {documentos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {documentos.map((arquivo, indice) => (
                    <div
                      key={`${arquivo.name}-${indice}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">
                          {arquivo.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-400">
                          Documento {indice + 1} de {documentos.length}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDocumentos((anteriores) =>
                            anteriores.filter(
                              (_, indiceAtual) =>
                                indiceAtual !== indice
                            )
                          );
                        }}
                        className="ml-3 text-xs font-semibold text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {documentos.length < 3 && (
                <p className="mt-3 text-xs text-zinc-400">
                  + Você pode adicionar mais{" "}
                  {3 - documentos.length} documento(s).
                </p>
              )}
            </div>
        
            {itemEditandoId && (
              <>
                <label className="mt-4 block text-sm font-medium">
                  Tema
                </label>

                <select
                  value={temaDestinoId}
                  onChange={(e) =>
                    setTemaDestinoId(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-white p-3 text-black"
                >
                  {todosTemas.map((temaOpcao) => (
                    <option
                      key={temaOpcao.id}
                      value={temaOpcao.id}
                    >
                      {temaOpcao.nome}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              type="button"
              onClick={
                itemEditandoId
                  ? salvarEdicao
                  : adicionarItem
              }
              className="mt-4 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white"
            >
              {itemEditandoId
                ? "Salvar alteração"
                : "Salvar item"}
            </button>

            {itemEditandoId &&
              temaDestinoId !== temaId && (
                <button
                  type="button"
                  onClick={() => moverItem()}
                  className="ml-2 mt-4 rounded-lg border border-purple-700 px-4 py-3 text-sm font-semibold text-purple-300"
                >
                  Mover para outro tema
                </button>
               )}
            </div>
            )}

            {!mostrarFormulario && (
              <>

          <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
            <label className="mb-2 block text-sm font-semibold text-white">
              Buscar neste tema
            </label>

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite título, descrição ou palavra-chave..."
              className="w-full rounded-lg border border-zinc-600 bg-white p-3 text-black"
            />
          </div>

            <button
              type="button"
              onClick={() =>
                setSomenteFavoritos((valor) => !valor)
              }
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                somenteFavoritos
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              ★Favoritos
            </button>

            <button
              type="button"
              onClick={() =>
                setSomenteComVideo((valor) => !valor)
              }
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                somenteComVideo
                  ? "border-purple-500 bg-purple-500/10 text-purple-300"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              ▶Vídeos
            </button>

            <button
              type="button"
              onClick={() =>
                setSomenteComDocumentos((valor) => !valor)
              }
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                somenteComDocumentos
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              📄Documentos
            </button>

            <button
              type="button"
              onClick={() =>
                setSomenteComImagens((valor) => !valor)
              }
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                somenteComImagens
                  ? "border-green-500 bg-green-500/10 text-green-300"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              🖼Imagens
            </button>

            <div className="mt-3">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Ordenar por
              </label>

              <select
                value={ordenacao}
                onChange={(e) =>
                  setOrdenacao(
                    e.target.value as "recentes" | "antigos" | "titulo"
                  )
                }
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="titulo">Título A–Z</option>
              </select>
            </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {itensOrdenados.map((item) => (
              <div
                key={item.id}
                className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm"
              >
                <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                  {item.quantidadeImagens && item.quantidadeImagens > 0 && (
                    <div
                      className="flex h-9 min-w-9 items-center justify-center rounded-full bg-black/70 px-2 text-sm text-white shadow"
                      title={`${item.quantidadeImagens} imagem(ns)`}
                      aria-label={`${item.quantidadeImagens} imagem(ns)`}
                    >
                      {item.quantidadeImagens} 🖼️
                    </div>
                  )}

                  {item.documentos && item.documentos.length > 0 && (
                    <div
                      className="flex h-9 min-w-9 items-center justify-center rounded-full bg-black/70 px-2 text-sm text-white shadow"
                      title={`${item.documentos.length} documento(s)`}
                      aria-label={`${item.documentos.length} documento(s)`}
                    >
                      {item.documentos.length} 📄
                    </div>
                  )}

                  {item.video && (
                    <a
                      href={item.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-sm text-white shadow hover:bg-black"
                      title="Assistir vídeo"
                      aria-label="Assistir vídeo"
                    >
                      ▶
                    </a>
                  )}
                </div>

                {capas[item.id] && (
                  <div className="h-48 w-full overflow-hidden bg-zinc-950">
                    <img
                      src={capas[item.id]}
                      alt={item.titulo}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `center ${item.posicaoImagemY ?? 50}%`,
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-semibold">
                    {item.titulo}
                  </h2>

                {item.descricao && (
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.descricao}
                  </p>
                )}

                {item.palavrasChave.length > 0 && (
                  <p className="mt-3 text-xs text-zinc-400">
                    {item.palavrasChave.join(" • ")}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/bookdigital/item/${item.id}`)
                    }
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500"
                  >
                    VER
                  </button>

                  <button
                    type="button"
                    onClick={() => iniciarEdicao(item)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => excluirItem(item.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                  >
                    Excluir
                  </button>

                  <button
                    type="button"
                    onClick={() => alternarFavorito(item.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    {item.favorito
                      ? "★ Favoritado"
                      : "☆ Favoritar"}
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
          </>
        )}
      </div>
    </main>
  );
}