"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type {
  ItemBiblioteca,
  Tema,
} from "@/types/bookdigital";

import {
  listarItens,
} from "@/app/lib/bookdigital-itens";

import {
  listarTemas,
} from "@/app/lib/bookdigital-temas";

import {
  obterImagemCapa,
  obterImagensItem,
} from "@/app/lib/bookdigital-imagens";

import {
  obterDocumento,
} from "@/app/lib/bookdigital-arquivos";

function formatarData(data?: string) {
  if (!data) return "—";

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "—";
  }

  return dataConvertida.toLocaleDateString("pt-BR");
}

function obterNomeLink(url: string) {
  try {
    const endereco = new URL(url);

    return endereco.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ItemBookDigitalPage() {
  const params = useParams();
  const router = useRouter();

  const itemId = String(params.id);

  const [item, setItem] =
    useState<ItemBiblioteca | null>(null);

  const [tema, setTema] =
    useState<Tema | null>(null);

  const [carregando, setCarregando] =
    useState(true);
 
  const [imagensItem, setImagensItem] =
      useState<string[]>([]);

  const [imagemCapa, setImagemCapa] = useState("");

  const [indiceImagem, setIndiceImagem] =
      useState(0);

  const [imagemAmpliada, setImagemAmpliada] = useState(false);

  const [documentosAbertos, setDocumentosAbertos] =
      useState<
        {
          chaveDocumento: string;
          nomeDocumento: string;
          url: string;
        }[]
      >([]);

  useEffect(() => {
    const urlsCriadas: string[] = [];
    
    const itens = listarItens();

    const itemEncontrado = itens.find(
      (registro) => registro.id === itemId
    );

    if (!itemEncontrado) {
      setCarregando(false);
      return;
    }

    setItem(itemEncontrado);

setDocumentosAbertos([]);

if (itemEncontrado.documentos?.length) {
  Promise.all(
    itemEncontrado.documentos.map(
      async (documento) => {
        const arquivo = await obterDocumento(
          documento.chaveDocumento
        );

        if (!arquivo) {
          return null;
        }

        const url =
          URL.createObjectURL(arquivo);
        
          urlsCriadas.push(url);

        return {
          chaveDocumento:
            documento.chaveDocumento,
          nomeDocumento:
            documento.nomeDocumento,
          url,
        };
      }
    )
  )
    .then((documentosCarregados) => {
      setDocumentosAbertos(
        documentosCarregados.filter(
          (
            documento
          ): documento is {
            chaveDocumento: string;
            nomeDocumento: string;
            url: string;
          } => documento !== null
        )
      );
    })
    .catch((erro) => {
      console.error(
        "Erro ao carregar documentos:",
        erro
      );

      setDocumentosAbertos([]);
    });
}

    setImagensItem([]);
    setIndiceImagem(0);

    setImagemCapa("");

if (itemEncontrado.chaveImagemCapa) {
  obterImagemCapa(
    itemEncontrado.chaveImagemCapa
  )
    .then((imagem) => {
      if (imagem) {
        setImagemCapa(imagem);
      }
    })
    .catch((erro) => {
      console.error(
        "Erro ao carregar capa do item:",
        erro
      );

      setImagemCapa("");
    });
}

    if (itemEncontrado.chaveImagens) {
      obterImagensItem(
        itemEncontrado.chaveImagens
      )
        .then((imagens) => {
          setImagensItem(imagens);
        })
        .catch((erro) => {
          console.error(
            "Erro ao carregar imagens do item:",
            erro
          );

          setImagensItem([]);
        });
    }

    const temas = listarTemas();

    const temaEncontrado = temas.find(
      (registro) =>
        registro.id === itemEncontrado.temaId
    );

    setTema(temaEncontrado ?? null);

    setCarregando(false);
  
    return () => {
      urlsCriadas.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  
  }, [itemId]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-sm text-zinc-400">
            Carregando item...
          </p>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="text-2xl font-bold">
            Item não encontrado
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/bookdigital")
            }
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
      {imagemCapa && (
        <div className="relative h-72 w-full overflow-hidden">
          <img
            src={imagemCapa}
            alt={item?.titulo || "Capa do item"}
            style={{
              objectPosition: `center ${item?.posicaoImagemY ?? 50}%`,
            }}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-4 top-4 rounded bg-black/60 px-3 py-1 text-white backdrop-blur transition hover:scale-105"
          >
            ← Voltar
          </button>

          <h1 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white">
            {item?.titulo}
          </h1>
        </div>
      )}

    <div className="mx-auto max-w-4xl px-4 py-8">
        {tema && (
          <p className="text-sm font-medium text-purple-400">
            {tema.nome}
          </p>
        )}

        {item.descricao && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-sm font-semibold text-zinc-300">
              Descrição
            </h2>

            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {item.descricao}
            </p>
          </div>
        )}

        {item.palavrasChave.length > 0 && (
  <div className="mt-6">
    <p className="text-sm font-semibold text-zinc-300">
      Palavras-chave
    </p>

    <p className="mt-2 text-sm text-zinc-500">
      {item.palavrasChave.join(" • ")}
    </p>
  </div>
)}

{imagensItem.length > 0 && (
  <div className="mt-6">
    <p className="mb-3 text-sm font-semibold text-zinc-300">
      Imagens
    </p>

    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="relative flex h-72 w-full items-center justify-center bg-zinc-950">
        <img
          src={imagensItem[indiceImagem]}
          alt={`Imagem ${indiceImagem + 1}`}
          onClick={() => setImagemAmpliada(true)}
          className="h-full w-full cursor-zoom-in object-contain"
        />
        {imagensItem.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setIndiceImagem((atual) =>
                  atual === 0
                    ? imagensItem.length - 1
                    : atual - 1
                )
              }
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-xl text-white hover:bg-black"
              aria-label="Imagem anterior"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() =>
                setIndiceImagem((atual) =>
                  atual === imagensItem.length - 1
                    ? 0
                    : atual + 1
                )
              }
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-xl text-white hover:bg-black"
              aria-label="Próxima imagem"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="border-t border-zinc-800 px-4 py-2 text-center text-xs text-zinc-500">
        {indiceImagem + 1} / {imagensItem.length}
      </div>
    </div>
  </div>
)}

{imagemAmpliada && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
    onClick={() => setImagemAmpliada(false)}
  >
    <button
      type="button"
      onClick={() => setImagemAmpliada(false)}
      className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xl text-white hover:bg-zinc-700"
      aria-label="Fechar imagem ampliada"
    >
      ×
    </button>

    {imagensItem.length > 1 && (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            setIndiceImagem((atual) =>
              atual === 0
                ? imagensItem.length - 1
                : atual - 1
            );
          }}
          className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white hover:bg-black"
          aria-label="Imagem anterior"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            setIndiceImagem((atual) =>
              atual === imagensItem.length - 1
                ? 0
                : atual + 1
            );
          }}
          className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white hover:bg-black"
          aria-label="Próxima imagem"
        >
          ›
        </button>
      </>
    )}

    <img
      src={imagensItem[indiceImagem]}
      alt={`Imagem ${indiceImagem + 1}`}
      onClick={(e) => e.stopPropagation()}
      className="h-[92vh] w-[95vw] cursor-zoom-out object-contain"
    />

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
      {indiceImagem + 1} / {imagensItem.length}
    </div>
  </div>
)}

      {item.documentos &&
        item.documentos.length > 0 && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-sm font-semibold text-zinc-300">
              Documentos
            </h2>

            <div className="mt-3 space-y-3">
              {item.documentos.map(
                (documento, indice) => {
                  const documentoAberto =
                    documentosAbertos.find(
                      (arquivo) =>
                        arquivo.chaveDocumento ===
                        documento.chaveDocumento
                    );

                  return (
                    <div
                      key={documento.chaveDocumento}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                    >
                      <p className="break-all text-sm text-zinc-300">
                        📄 {documento.nomeDocumento}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Documento {indice + 1} de{" "}
                        {item.documentos!.length}
                      </p>

                      {documentoAberto && (
                        <a
                          href={documentoAberto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                        >
                          Abrir documento
                        </a>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
         

{(item.origem || item.video) && (
  <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
    <h2 className="text-sm font-semibold text-zinc-300">
      Links e acesso
    </h2>

    {item.origem && (
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Origem
        </p>

        <a
          href={item.origem}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-sm text-blue-400 underline hover:text-blue-300"
        >
          {item.origem}
        </a>
      </div>
    )}

    {item.video && (
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Vídeo
        </p>

        <a
          href={item.video}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-sm text-blue-400 underline hover:text-blue-300"
        >
          ▶ Assistir vídeo
        </a>
      </div>
    )}
  </div>
)}

    {item.links && item.links.length > 0 && (
      <div>
        <p className="text-xs uppercase text-zinc-500">
          Links externos
        </p>

        <div className="mt-1 space-y-1">
          {item.links.map((link, indice) => (
            <a
              key={`${link}-${indice}`}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-sm text-blue-400 underline"
            >
              {obterNomeLink(link)}
            </a>
          ))}
        </div>
      </div>
    )}

        {item.favorito && (
          <div className="mt-6 text-sm font-medium text-yellow-400">
            ★ Favoritado
          </div>
        )}

        <div className="mt-8 border-t border-zinc-800 pt-4">
          <div className="space-y-1 text-xs text-zinc-500">
            <p>
              Criado em: {formatarData(item.criadoEm)}
            </p>

            <p>
              Atualizado em: {formatarData(item.atualizadoEm)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}