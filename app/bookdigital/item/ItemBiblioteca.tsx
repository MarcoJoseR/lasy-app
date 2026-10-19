"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

import {
  obterAudio,
} from "@/app/lib/bookdigital-audios";

// COMPARTILHAR ITEM — Última preparação
import {
  salvarUltimaPreparacao,
  obterUltimaPreparacao,
  identificarImagem,
} from "@/app/lib/bookdigital-compartilhamento";

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
interface ItemBibliotecaProps {
  itemId: string;
}

export default function ItemBiblioteca({
  itemId,
}: ItemBibliotecaProps) {
  const router = useRouter();

// =============================================
// COMPARTILHAR ITEM — SALVAR ÚLTIMA SELEÇÃO
// =============================================
  async function salvarSelecaoAtual():
  Promise<boolean | "desatualizada"> {
    if (!item) return false;

    // Identificar a versão desta preparação
    const versaoAtual = versaoSelecao.current;

    try {

// Identificar somente as imagens selecionadas
    const identificadoresImagens = await Promise.all(
      imagensSelecionadas
        .filter((indice) => Boolean(imagensItem[indice]))
        .map((indice) =>
          identificarImagem(imagensItem[indice])
        )
    );

    // Converter os links selecionados em endereços
    const linksAtuais = [
      ...(item.origem
        ? [{ id: "origem", url: item.origem }]
        : []),

      ...(item.video
        ? [{ id: "video", url: item.video }]
        : []),

      ...(item.links || []).map((link, indice) => ({
        id: `link-${indice}`,
        url: link,
      })),
    ];

    const enderecosSelecionados = linksAtuais
      .filter((link) =>
        linksSelecionados.includes(link.id)
      )
      .map((link) => link.url);

    // Impedir gravação de uma preparação desatualizada
    if (versaoAtual !== versaoSelecao.current) {
      return "desatualizada";
    }

    salvarUltimaPreparacao(itemId, {
      descricao: descricaoCompartilhar,
      imagensSelecionadas: identificadoresImagens,
      documentosSelecionados,
      audiosSelecionados,
      linksSelecionados: enderecosSelecionados,
      atualizadoEm: new Date().toISOString(),
      
    });

    // Registrar a versão que foi gravada com sucesso
    ultimaVersaoSalva.current = versaoAtual;

    return true;
  } catch (erro) {
    console.error(
      "Erro ao preparar última seleção:",
      erro
    );

    return false;
  }
}

// =============================================
// COMPARTILHAR ITEM — RECUPERAR ÚLTIMA SELEÇÃO
// =============================================

async function recuperarUltimaSelecao() {
  if (!item) return;

  const preparacao = obterUltimaPreparacao(itemId);

  if (!preparacao) {
    window.alert(
      "Nenhuma preparação anterior foi encontrada."
    );
    return;
  }

  try {
    // Recuperar descrição
    setDescricaoCompartilhar(preparacao.descricao);

    // Identificar as imagens atuais
    const identificadores = await Promise.all(
      imagensItem.map((imagem) =>
        identificarImagem(imagem)
      )
    );

    // Recuperar somente imagens correspondentes.
    // Em caso de imagens idênticas, não selecionar
    // automaticamente ocorrências duplicadas.
    const indicesRecuperados: number[] = [];
    const identificadoresUtilizados = new Set<string>();

    identificadores.forEach((identificador, indice) => {
      if (
        preparacao.imagensSelecionadas.includes(identificador) &&
        !identificadoresUtilizados.has(identificador)
      ) {
        indicesRecuperados.push(indice);
        identificadoresUtilizados.add(identificador);
      }
    });

    setImagensSelecionadas(indicesRecuperados);

    // Recuperar documentos que ainda existem
    const documentosRecuperados = (item.documentos || [])
      .filter((documento) =>
        preparacao.documentosSelecionados.includes(
          documento.chaveDocumento
        )
      )
      .map((documento) => documento.chaveDocumento);

    // Recuperar áudios que ainda existem
    const audiosRecuperados = audiosExistentes
      .filter((audio) =>
        preparacao.audiosSelecionados.includes(audio.chave)
      )
      .map((audio) => audio.chave);
      
    // Conferir a quantidade total de arquivos
    const totalRecuperado =
      indicesRecuperados.length +
      documentosRecuperados.length +
      audiosRecuperados.length;

    // Preservar integralmente a preparação anterior
    if (totalRecuperado > 10) {
      window.alert(
        "A preparação anterior contém " +
        totalRecuperado +
        " arquivos.\n\n" +
        "O limite atual é de 10 arquivos por envio.\n\n" +
        "Sua preparação foi preservada. " +
        "Desmarque os arquivos excedentes antes de compartilhar."
      );
    }

    // Restaurar a seleção sem excluir arquivos
    setImagensSelecionadas(indicesRecuperados);
    setDocumentosSelecionados(documentosRecuperados);
    setAudiosSelecionados(audiosRecuperados);

    // Recuperar links por endereço original
    const linksAtuais = [
      ...(item.origem
        ? [{ id: "origem", url: item.origem }]
        : []),

      ...(item.video
        ? [{ id: "video", url: item.video }]
        : []),

      ...(item.links || []).map((link, indice) => ({
        id: `link-${indice}`,
        url: link,
      })),
    ];

    setLinksSelecionados(
      linksAtuais
        .filter((link) =>
          preparacao.linksSelecionados.includes(link.url)
        )
        .map((link) => link.id)
    );

    // Invalidar gravações iniciadas anteriormente
      versaoSelecao.current += 1;

      // A recuperação não é uma nova alteração
      setSelecaoModificada(false);

      // Registrar a versão recuperada como referência
      ultimaVersaoSalva.current = versaoSelecao.current;

      setRevisaoCompartilhamento(false);

      // Confirmar que a seleção foi recuperada
      setSelecaoRecuperada(true);

      } catch (erro) {

    console.error(
      "Erro ao recuperar última seleção:",
      erro
    );

    window.alert(
      "Não foi possível recuperar a última preparação."
    );
  }
}

function voltarDaPaginaVer() {
  if (!item) return;

  // Retornar à Lista de Acompanhamento
  const origemAcompanhamento = sessionStorage.getItem(
    "bookdigitalOrigemAcompanhamento"
  );

  if (origemAcompanhamento === item.id) {
    sessionStorage.removeItem(
      "bookdigitalOrigemAcompanhamento"
    );

    sessionStorage.removeItem(
      "bookdigitalOrigemBuscaGeral"
    );

    sessionStorage.removeItem(
      "bookdigitalCardRetorno"
    );

    window.location.assign(
      "/bookdigital/acompanhamento"
    );
    return;
  }

  // Limpar origem de acompanhamento de outro item
  if (origemAcompanhamento) {
    sessionStorage.removeItem(
      "bookdigitalOrigemAcompanhamento"
    );
  }

  const origemSalva = sessionStorage.getItem(
    "bookdigitalOrigemBuscaGeral"
  );

  if (origemSalva) {
    try {
      const origem = JSON.parse(origemSalva);

      if (origem.itemId === item.id) {
        sessionStorage.setItem(
          "bookdigitalBuscaRestaurar",
          origem.busca ?? ""
        );

        sessionStorage.removeItem(
          "bookdigitalOrigemBuscaGeral"
        );

        sessionStorage.removeItem(
          "bookdigitalCardRetorno"
        );

        window.location.assign("/bookdigital");
        return;
      }
    } catch {
      sessionStorage.removeItem(
        "bookdigitalOrigemBuscaGeral"
      );
    }
  }

  sessionStorage.setItem(
    "bookdigitalCardRetorno",
    JSON.stringify({
      temaId: item.temaId,
      itemId: item.id,
    })
  );

  window.location.assign(
    `/bookdigital/tema/offline?id=${encodeURIComponent(item.temaId)}`
  );
}

function controlarReproducao(
  audioAtual: HTMLAudioElement
) {
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio !== audioAtual) {
      audio.pause();
    }
  });
}

  const [item, setItem] =
    useState<ItemBiblioteca | null>(null);

  const [tema, setTema] =
    useState<Tema | null>(null);

  const [carregando, setCarregando] =
    useState(true);
 
  const [imagensItem, setImagensItem] =
      useState<string[]>([]);

  const [imagemCapa, setImagemCapa] = useState("");

  const [audiosExistentes, setAudiosExistentes] = useState<
    { chave: string; url: string }[]
  >([]);

  const [indiceImagem, setIndiceImagem] =
      useState(0);

  const [imagemAmpliada, setImagemAmpliada] = useState(false);

  // COMPARTILHAR ITEM — Controle do painel
  const [compartilhamentoAberto, setCompartilhamentoAberto] =
    useState(false);

  // COMPARTILHAR ITEM — Controle da revisão final
  const [revisaoCompartilhamento, setRevisaoCompartilhamento] =
    useState(false);

  const inicioRevisaoRef = useRef<HTMLDivElement>(null);

  // COMPARTILHAR ITEM — Última preparação disponível
  const [ultimaPreparacaoDisponivel, setUltimaPreparacaoDisponivel] =
    useState(false);

  // COMPARTILHAR ITEM — Controle de alterações
  const [selecaoModificada, setSelecaoModificada] =
    useState(false);

  // COMPARTILHAR ITEM — Controle do salvamento automático
  const salvamentoEmAndamento = useRef(false);

  // COMPARTILHAR ITEM — Versão das alterações
  const versaoSelecao = useRef(0);

  // COMPARTILHAR ITEM — Controle do salvamento automático
  const ultimaVersaoSalva = useRef(0);

  // COMPARTILHAR ITEM — Registrar nova alteração
  function registrarAlteracaoSelecao() {
    versaoSelecao.current += 1;
    setSelecaoModificada(true);
  }

// COMPARTILHAR ITEM — Converter imagem em arquivo
async function prepararImagemCompartilhamento(
  imagem: string,
  numero: number
): Promise<File> {
  const resposta = await fetch(imagem);
  const arquivo = await resposta.blob();

  const extensao =
    arquivo.type === "image/png" ? "png" : "jpg";

  return new File(
    [arquivo],
    `imagem-${numero}.${extensao}`,
    { type: arquivo.type || "image/jpeg" }
  );
}

// COMPARTILHAR ITEM — Preparar documento PDF
  async function prepararPDFCompartilhamento(
    chaveDocumento: string,
    nomeDocumento: string
  ): Promise<File> {
    const arquivo = await obterDocumento(chaveDocumento);

    if (!arquivo) {
      throw new Error("Documento PDF não encontrado.");
    }

    const nomeArquivo = nomeDocumento
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\.pdf$/i, "") + ".pdf";

    return new File(
      [arquivo],
      nomeArquivo,
      { type: "application/pdf" }
    );
  }

// COMPARTILHAR ITEM — Preparar áudio
async function prepararAudioCompartilhamento(
  chaveAudio: string,
  numero: number
): Promise<File> {
  const arquivo = await obterAudio(chaveAudio);

  if (!arquivo) {
    throw new Error("Áudio não encontrado.");
  }

  // Preservar o formato original do arquivo
  const tipo =
  arquivo.type.split(";")[0] ||
  "application/octet-stream";

  // DIAGNÓSTICO — Formato original do áudio
  console.log("DIAGNÓSTICO ÁUDIO:", {
    chave: chaveAudio,
    tipoOriginal: arquivo.type,
    tamanhoBytes: arquivo.size,
  });

  let extensao = "bin";

  if (tipo.includes("mpeg") || tipo.includes("mp3")) {
    extensao = "mp3";
  } else if (tipo.includes("mp4")) {
    extensao = "m4a";
  } else if (tipo.includes("webm")) {
    extensao = "webm";
  } else if (tipo.includes("ogg")) {
    extensao = "ogg";
  } else if (tipo.includes("wav")) {
    extensao = "wav";
  }

  
return new File(
  [arquivo],
  `audio-${numero}.${extensao}`,
  {
    type:
      extensao === "m4a"
        ? "audio/x-m4a"
        : tipo,
  }
);

}

  // COMPARTILHAR ITEM — Preparar pacote de arquivos
    async function prepararPacoteCompartilhamento(): Promise<File[]> {
      if (!item) {
        throw new Error("Item não encontrado.");
      }

      const arquivos: File[] = [];

      // Imagens selecionadas
      for (const indice of imagensSelecionadas) {
        const imagem = imagensItem[indice];

        if (!imagem) {
          throw new Error("Imagem selecionada não encontrada.");
        }

        arquivos.push(
          await prepararImagemCompartilhamento(imagem, indice + 1)
        );
      }

      // Documentos PDF selecionados
      for (const documento of item.documentos || []) {
        if (!documentosSelecionados.includes(documento.chaveDocumento)) {
          continue;
        }

        arquivos.push(
          await prepararPDFCompartilhamento(
            documento.chaveDocumento,
            documento.nomeDocumento
          )
        );
      }

      // Áudios selecionados
      for (const [indice, audio] of audiosExistentes.entries()) {
        if (!audiosSelecionados.includes(audio.chave)) {
          continue;
        }

        arquivos.push(
          await prepararAudioCompartilhamento(
            audio.chave,
            indice + 1
          )
        );
      }

      return arquivos;
    }

    // COMPARTILHAR ITEM — Teste de envio completo
      async function testarCompartilhamentoCompleto() {
        if (!item) return;

        if (typeof navigator.share !== "function") {
          window.alert(
            "Este navegador não oferece compartilhamento nativo."
          );
          return;
        }

        try {
          // Verificar se as imagens selecionadas estão prontas
if (
  imagensSelecionadas.length > 0 &&
  (
    imagensPreparando ||
    imagensPreparadas.length !== imagensSelecionadas.length ||
    chaveImagensPreparadas !== chaveSelecaoImagens
  )
) {

  window.alert(
    "As imagens ainda estão sendo preparadas. Tente novamente."
  );
  return;
}

// Aproveitar as imagens preparadas antecipadamente
const arquivos: File[] = [...imagensPreparadas];

// Preparar os PDFs selecionados
for (const documento of item.documentos || []) {
  if (!documentosSelecionados.includes(documento.chaveDocumento)) {
    continue;
  }

  arquivos.push(
    await prepararPDFCompartilhamento(
      documento.chaveDocumento,
      documento.nomeDocumento
    )
  );
}

// Preparar os áudios selecionados
for (const [indice, audio] of audiosExistentes.entries()) {
  if (!audiosSelecionados.includes(audio.chave)) {
    continue;
  }

  arquivos.push(
    await prepararAudioCompartilhamento(
      audio.chave,
      indice + 1
    )
  );
}

          // Preparar somente os links selecionados
          const linksAtuais = [
            ...(item.origem
              ? [{ id: "origem", url: item.origem }]
              : []),

            ...(item.video
              ? [{ id: "video", url: item.video }]
              : []),

            ...(item.links || []).map((link, indice) => ({
              id: `link-${indice}`,
              url: link,
            })),
          ];

          const enderecos = linksAtuais
            .filter((link) => linksSelecionados.includes(link.id))
            .map((link) => link.url);

          const texto = [
            item.titulo,
            descricaoCompartilhar.trim(),
            ...enderecos,
          ]
            .filter(Boolean)
            .join("\n\n");

          if (arquivos.length === 0 && !texto) {
            window.alert("Nenhum conteúdo foi selecionado.");
            return;
          }

        // COMPARTILHAR ITEM — Limite de arquivos do navegador
          if (arquivos.length > 10) {
            const resultado = await salvarSelecaoAtual();

            if (resultado !== true) {
              window.alert(
                "O navegador permite compartilhar até 10 arquivos por vez.\n\n" +
                "Não foi possível confirmar o salvamento da seleção. " +
                "Verifique sua seleção antes de continuar."
              );
              return;
            }

            window.alert(
              "Limite de compartilhamento atingido.\n\n" +
              "O navegador permite compartilhar até 10 arquivos por vez.\n\n" +
              "Sua seleção foi preservada. Envie os arquivos " +
              "em grupos menores e utilize 'Recuperar última seleção' " +
              "para continuar."
            );
            return;
          }

          const dados: ShareData = {
            ...(texto ? { text: texto } : {}),
            ...(arquivos.length > 0 ? { files: arquivos } : {}),
          };

          if (
            arquivos.length > 0 &&
            typeof navigator.canShare === "function" &&
            !navigator.canShare({ files: arquivos })
          ) {
            window.alert(
              "Este navegador não aceita o conjunto de arquivos selecionado."
            );
            return;
          }

          await navigator.share(dados);

        } catch (erro) {
          if (
            erro instanceof DOMException &&
            erro.name === "AbortError"
          ) {
            return;
          }

          const detalhe =
            erro instanceof Error
              ? `${erro.name}: ${erro.message}`
              : String(erro);

          window.alert(
            "Não foi possível compartilhar o pacote completo.\n\n" +
            detalhe
          );

        }
      }
      
  // Texto temporário para compartilhamento
  const [descricaoCompartilhar, setDescricaoCompartilhar] =
    useState("");

  // COMPARTILHAR ITEM — Imagens selecionadas
  const [imagensSelecionadas, setImagensSelecionadas] =
    useState<number[]>([]);

    // COMPARTILHAR ITEM — Imagens preparadas antecipadamente
const [imagensPreparadas, setImagensPreparadas] =
  useState<File[]>([]);

const [imagensPreparando, setImagensPreparando] =
  useState(false);

// COMPARTILHAR ITEM — Confirmação da recuperação
const [selecaoRecuperada, setSelecaoRecuperada] =
  useState(false);

  // Identificação da seleção correspondente ao pacote
const [chaveImagensPreparadas, setChaveImagensPreparadas] =
  useState<string | null>(null);

const chaveSelecaoImagens =
  JSON.stringify(imagensSelecionadas);

  // COMPARTILHAR ITEM — Documentos selecionados
  const [documentosSelecionados, setDocumentosSelecionados] =
    useState<string[]>([]);

  // COMPARTILHAR ITEM — Áudios selecionados
  const [audiosSelecionados, setAudiosSelecionados] =
    useState<string[]>([]);

  // COMPARTILHAR ITEM — Links selecionados
  const [linksSelecionados, setLinksSelecionados] =
    useState<string[]>([]);

  const [documentosAbertos, setDocumentosAbertos] =
      useState<
        {
          chaveDocumento: string;
          nomeDocumento: string;
          url: string;
        }[]
      >([]);

  useEffect(() => {
    if (!revisaoCompartilhamento) return;

    const id = requestAnimationFrame(() => {
      inicioRevisaoRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(id);
  }, [revisaoCompartilhamento]);

  useEffect(() => {
    const urlsCriadas: string[] = [];
    let cancelado = false;
    
    const itens = listarItens();

    const itemEncontrado = itens.find(
      (registro) => registro.id === itemId
    );

    if (!itemEncontrado) {
      setCarregando(false);
      return;
    }

    setItem(itemEncontrado);

    setAudiosExistentes([]);

    const chavesAudios = [...new Set([
      ...(itemEncontrado.chaveAudio
        ? [itemEncontrado.chaveAudio]
        : []),
      ...(itemEncontrado.chavesAudios ?? []),
    ])];

    Promise.all(
      chavesAudios.map(async (chave) => {
        const arquivo = await obterAudio(chave);

        if (!arquivo) return null;

        const url = URL.createObjectURL(arquivo);

        urlsCriadas.push(url);

        return {
          chave,
          url,
        };
      })
    )
      .then((audiosCarregados) => {
        if (cancelado) {
          return;
        }
        setAudiosExistentes(
          audiosCarregados.filter(
            (audio): audio is {
              chave: string;
              url: string;
            } => audio !== null
          )
        );
      })
      .catch((erro) => {
        console.error(
          "Erro ao carregar áudios do item:",
          erro
        );
      });

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
      cancelado = true;
      
      urlsCriadas.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  
  }, [itemId]);

    // COMPARTILHAR ITEM — Salvamento automático
    useEffect(() => {
      if (
        !compartilhamentoAberto ||
        !selecaoModificada ||
        !item
      ) {
        return;
      }

      // Capturar a versão desta alteração
      const versaoAgendada = versaoSelecao.current;

      // Aguardar um breve intervalo sem novas alterações
      const temporizador = setTimeout(async () => {
        if (versaoAgendada !== versaoSelecao.current) {
          return;
        }

        const resultado = await salvarSelecaoAtual();

        // Confirmar que a gravação corresponde
        // à versão mais recente
        if (
          resultado === true &&
          ultimaVersaoSalva.current === versaoSelecao.current
        ) {
          setSelecaoModificada(false);
          setUltimaPreparacaoDisponivel(true);
        }
      }, 800);

      return () => {
        clearTimeout(temporizador);
      };
    }, [
      compartilhamentoAberto,
      selecaoModificada,
      item,
      descricaoCompartilhar,
      imagensSelecionadas,
      documentosSelecionados,
      audiosSelecionados,
      linksSelecionados,
    ]);

// =============================================
// COMPARTILHAR ITEM — Preparação antecipada das imagens
// =============================================
useEffect(() => {
  let cancelado = false;

  // Invalidar o pacote anterior
  setImagensPreparadas([]);
  setImagensPreparando(false);
  setChaveImagensPreparadas(null);

  if (
    !compartilhamentoAberto ||
    imagensSelecionadas.length === 0
  ) {
    return;
  }

  setImagensPreparando(true);

  async function prepararImagens() {
    try {
      const arquivos = await Promise.all(
        imagensSelecionadas.map(async (indice) => {
          const imagem = imagensItem[indice];

          if (!imagem) {
            throw new Error(
              `Imagem ${indice + 1} não encontrada.`
            );
          }

          return prepararImagemCompartilhamento(
            imagem,
            indice + 1
          );
        })
      );

      if (!cancelado) {
  setImagensPreparadas(arquivos);
  setChaveImagensPreparadas(
    JSON.stringify(imagensSelecionadas)
  );
}

    } catch (erro) {
      if (!cancelado) {
        console.error(
          "Erro ao preparar imagens para compartilhamento:",
          erro
        );
        setImagensPreparadas([]);
      }
    } finally {
      if (!cancelado) {
        setImagensPreparando(false);
      }
    }
  }

  prepararImagens();

  return () => {
    cancelado = true;
  };
}, [
  compartilhamentoAberto,
  imagensSelecionadas,
  imagensItem,
]);

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
            onClick={() => {
              router.push("/bookdigital");
            }}
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
            onClick={voltarDaPaginaVer}
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
      {!imagemCapa && (
        <>
          <button
            type="button"
            onClick={voltarDaPaginaVer}
            className="mb-5 rounded bg-zinc-800 px-3 py-2 text-white transition hover:bg-zinc-700"
          >
            ← Voltar
          </button>

          <h1 className="mb-4 text-2xl font-bold text-white">
            {item.titulo}
          </h1>
        </>
      )}
        {tema && (
          <p className="text-sm font-medium text-purple-400">
            {tema.nome}
          </p>
        )}

      {/* COMPARTILHAR ITEM — Botão principal */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            // Verificar preparação anterior deste item
            const preparacaoAnterior =
              obterUltimaPreparacao(itemId);

            setUltimaPreparacaoDisponivel(
              preparacaoAnterior !== null
            );

            // Iniciar uma seleção limpa
            setDescricaoCompartilhar(item.descricao || "");

            setImagensSelecionadas([]);
            setDocumentosSelecionados([]);
            setAudiosSelecionados([]);
            setLinksSelecionados([]);

            // Invalidar gravações anteriores ainda em processamento
            versaoSelecao.current += 1;

            // Nova preparação começa sem alterações
            setSelecaoModificada(false);

            // Estabelecer a referência da nova preparação
            ultimaVersaoSalva.current = versaoSelecao.current;

            setRevisaoCompartilhamento(false);
            setCompartilhamentoAberto(true);
          }}

          className="rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-600"
        >
          ↗ Compartilhar Item
        </button>
      </div>

      {/* COMPARTILHAR ITEM — Painel de seleção */}
      {compartilhamentoAberto && (
        <div
          className={`mt-4 rounded-xl border-2 bg-zinc-950 p-5 ${
            revisaoCompartilhamento
              ? "border-purple-500"
              : "border-purple-800"
          }`}
        >

          {/* Exibir formulário somente durante a seleção */}
          {!revisaoCompartilhamento && (
            <>
              <h2 className="text-lg font-bold text-white">
                Preparar compartilhamento
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Escolha os conteúdos que deseja enviar.
                Os dados originais serão preservados.
              </p>

        {/* COMPARTILHAR ITEM — Recuperação anterior */}
        {ultimaPreparacaoDisponivel && (
          <div className="mt-5 rounded-lg border border-purple-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-300">
              Existe uma preparação anterior deste item.
            </p>

            <button
              type="button"
              onClick={recuperarUltimaSelecao}
              className="mt-3 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
            >
              Recuperar última seleção
            </button>

            {selecaoRecuperada && (
              <p
                role="status"
                className="mt-2 text-sm text-green-400"
              >
                ✓ Última seleção recuperada.
              </p>
            )}

          </div>
        )}

          {item.descricao && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Descrição para compartilhar
              </label>

              <textarea
                value={descricaoCompartilhar}
                onChange={(e) => {
                  setDescricaoCompartilhar(e.target.value);
                  registrarAlteracaoSelecao();
                }}
                rows={6}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-white"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Apague os trechos que não deseja compartilhar.
                O texto original do item será preservado.
              </p>
            </div>
          )}

            {/* COMPARTILHAR ITEM — Seleção de imagens */}
            {imagensItem.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                  Imagens para compartilhar
                </h3>

                <div className="space-y-3">
                  {imagensItem.map((imagem, indice) => (
                    <label
                      key={indice}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={imagensSelecionadas.includes(indice)}
                        onChange={() => {
                          const jaSelecionada =
                            imagensSelecionadas.includes(indice);

                          // Desmarcar sempre é permitido
                          if (jaSelecionada) {
                            setImagensSelecionadas((anteriores) =>
                              anteriores.filter((numero) => numero !== indice)
                            );

                            registrarAlteracaoSelecao();
                            return;
                          }

                          // Contar todos os tipos de arquivos selecionados
                          const totalArquivos =
                            imagensSelecionadas.length +
                            documentosSelecionados.length +
                            audiosSelecionados.length;

                          // Impedir apenas uma nova marcação acima do limite
                          if (totalArquivos >= 10) {
                            window.alert(
                              "Limite de 10 arquivos por envio.\n\n" +
                              "Você já selecionou 10 arquivos.\n\n" +
                              "Para adicionar outro, desmarque um dos arquivos " +
                              "selecionados ou compartilhe este grupo e depois " +
                              "inicie uma nova seleção."
                            );
                            return;
                          }

                          // Adicionar a imagem selecionada
                          setImagensSelecionadas((anteriores) => [
                            ...anteriores,
                            indice,
                          ]);

                          registrarAlteracaoSelecao();
                        }}

                        className="h-4 w-4 accent-purple-600"
                      />

                      <img
                        src={imagem}
                        alt={`Imagem ${indice + 1}`}
                        className="h-14 w-14 rounded object-contain"
                      />

                      <span className="text-sm text-white">
                        Imagem {indice + 1}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* COMPARTILHAR ITEM — Seleção de documentos */}
            {item.documentos && item.documentos.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                  Documentos para compartilhar
                </h3>

                <div className="space-y-3">
                  {item.documentos.map((documento) => (
                    <label
                      key={documento.chaveDocumento}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={documentosSelecionados.includes(
                          documento.chaveDocumento
                        )}
                        onChange={() => {
                          const jaSelecionado =
                            documentosSelecionados.includes(
                              documento.chaveDocumento
                            );

                          // Desmarcar sempre é permitido
                          if (jaSelecionado) {
                            setDocumentosSelecionados((anteriores) =>
                              anteriores.filter(
                                (chave) => chave !== documento.chaveDocumento
                              )
                            );

                            registrarAlteracaoSelecao();
                            return;
                          }

                          // Contar todos os arquivos selecionados
                          const totalArquivos =
                            imagensSelecionadas.length +
                            documentosSelecionados.length +
                            audiosSelecionados.length;

                          // Impedir uma nova marcação acima do limite
                          if (totalArquivos >= 10) {
                            window.alert(
                              "Limite de 10 arquivos por envio.\n\n" +
                              "Você já selecionou 10 arquivos.\n\n" +
                              "Para adicionar outro, desmarque um dos arquivos " +
                              "selecionados ou compartilhe este grupo e depois " +
                              "inicie uma nova seleção."
                            );
                            return;
                          }

                          // Adicionar o documento selecionado
                          setDocumentosSelecionados((anteriores) => [
                            ...anteriores,
                            documento.chaveDocumento,
                          ]);

                          registrarAlteracaoSelecao();
                        }}

                        className="h-4 w-4 accent-purple-600"
                      />

                      <span className="break-all text-sm text-white">
                        📄 {documento.nomeDocumento}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* COMPARTILHAR ITEM — Seleção de áudios */}
            {audiosExistentes.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                  Áudios para compartilhar
                </h3>

                <div className="space-y-3">
                  {audiosExistentes.map((audio, indice) => (
                    <label
                      key={audio.chave}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={audiosSelecionados.includes(audio.chave)}
                        onChange={() => {
                          const jaSelecionado =
                            audiosSelecionados.includes(audio.chave);

                          // Desmarcar sempre é permitido
                          if (jaSelecionado) {
                            setAudiosSelecionados((anteriores) =>
                              anteriores.filter(
                                (chave) => chave !== audio.chave
                              )
                            );

                            registrarAlteracaoSelecao();
                            return;
                          }

                          // Contar todos os arquivos selecionados
                          const totalArquivos =
                            imagensSelecionadas.length +
                            documentosSelecionados.length +
                            audiosSelecionados.length;

                          // Impedir uma nova marcação acima do limite
                          if (totalArquivos >= 10) {
                            window.alert(
                              "Limite de 10 arquivos por envio.\n\n" +
                              "Você já selecionou 10 arquivos.\n\n" +
                              "Para adicionar outro, desmarque um dos arquivos " +
                              "selecionados ou compartilhe este grupo e depois " +
                              "inicie uma nova seleção."
                            );
                            return;
                          }

                          // Adicionar o áudio selecionado
                          setAudiosSelecionados((anteriores) => [
                            ...anteriores,
                            audio.chave,
                          ]);

                          registrarAlteracaoSelecao();
                        }}

                        className="mt-1 h-4 w-4 accent-purple-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          Áudio {indice + 1}
                        </p>

                        {item.referenciasAudios?.[audio.chave] && (
                          <p className="mt-2 break-words text-sm text-zinc-400">
                            {item.referenciasAudios[audio.chave]}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* COMPARTILHAR ITEM — Seleção de links */}
            {(item.origem ||
              item.video ||
              (item.links && item.links.length > 0)) && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                  Links para compartilhar
                </h3>

                <div className="space-y-3">
                  {[
                    ...(item.origem
                      ? [{ id: "origem", nome: "Origem", url: item.origem }]
                      : []),

                    ...(item.video
                      ? [{ id: "video", nome: "Vídeo", url: item.video }]
                      : []),

                    ...(item.links || []).map((link, indice) => ({
                      id: `link-${indice}`,
                      nome: `Link externo ${indice + 1}`,
                      url: link,
                    })),
                  ].map((link) => (
                    <label
                      key={link.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={linksSelecionados.includes(link.id)}
                        onChange={() => {
                          setLinksSelecionados((anteriores) =>
                            anteriores.includes(link.id)
                              ? anteriores.filter((id) => id !== link.id)
                              : [...anteriores, link.id]
                          );

                          registrarAlteracaoSelecao();
                        }}
                        className="mt-1 h-4 w-4 accent-purple-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {link.nome}
                        </p>

                        <p className="mt-1 break-all text-xs text-zinc-400">
                          {link.url}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (selecaoModificada) {
                      const resultado = await salvarSelecaoAtual();

                      if (resultado !== true) {
                        window.alert(
                          resultado === "desatualizada"
                            ? "A seleção foi modificada durante o salvamento. Tente fechar novamente."
                            : "Não foi possível salvar a preparação. Tente novamente."
                        );
                        return;
                      }

                      setSelecaoModificada(false);
                      setUltimaPreparacaoDisponivel(true);
                    }

                    setCompartilhamentoAberto(false);
                  }}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const salvou = await salvarSelecaoAtual();

                    if (salvou === "desatualizada") {
                      window.alert(
                        "A seleção foi modificada durante a preparação. Clique novamente em Revisar seleção."
                      );
                      return;
                    }

                    if (salvou === false) {
                      window.alert(
                        "Não foi possível salvar a preparação. Tente novamente."
                      );
                      return;
                    }

                    // A preparação foi gravada com sucesso
                    setSelecaoModificada(false);

                    setUltimaPreparacaoDisponivel(true);
                    setRevisaoCompartilhamento(true);
                   }}
                   
                   className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                  >
                  Revisar seleção
                </button>
              </div>

             </>
            )}

           {/* COMPARTILHAR ITEM — Revisão final */}
            {revisaoCompartilhamento && (
              <div ref={inicioRevisaoRef}>
                    
                <h2 className="text-lg font-bold text-white">
                  Revisar compartilhamento
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  Confira os conteúdos selecionados antes de enviar.
                </p>

                <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs font-semibold text-zinc-400">
                    Item
                  </p>

                  <p className="mt-1 text-base font-semibold text-white">
                    {item.titulo}
                  </p>
                </div>

                {descricaoCompartilhar.trim() && (
                  <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                    <h3 className="text-sm font-semibold text-white">
                      Descrição selecionada
                    </h3>

                    <p className="mt-3 whitespace-pre-line break-words text-sm text-zinc-300">
                      {descricaoCompartilhar}
                    </p>
                  </div>
                )}

              {/* REVISÃO — Imagens selecionadas */}
              {imagensSelecionadas.length > 0 && (
                <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Imagens selecionadas ({imagensSelecionadas.length})
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {imagensSelecionadas.map((indice) =>
                      imagensItem[indice] ? (
                        <div key={indice}>
                          <img
                            src={imagensItem[indice]}
                            alt={`Imagem ${indice + 1}`}
                            className="h-28 w-full rounded-lg border border-zinc-700 object-contain"
                          />

                          <p className="mt-1 text-center text-xs text-zinc-400">
                            Imagem {indice + 1}
                          </p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* REVISÃO — Documentos selecionados */}
              {item.documentos &&
                documentosSelecionados.length > 0 && (
                  <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                    <h3 className="text-sm font-semibold text-white">
                      Documentos selecionados
                    </h3>

                    <div className="mt-3 space-y-2">
                      {item.documentos
                        .filter((documento) =>
                          documentosSelecionados.includes(
                            documento.chaveDocumento
                          )
                        )
                        .map((documento) => (
                          <div
                            key={documento.chaveDocumento}
                            className="rounded-lg border border-zinc-700 p-3"
                          >
                            <p className="break-all text-sm text-zinc-300">
                              📄 {documento.nomeDocumento}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* REVISÃO — Áudios selecionados */}
              {audiosSelecionados.length > 0 && (
                <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Áudios selecionados
                  </h3>

                  <div className="mt-3 space-y-3">
                    {audiosExistentes
                      .filter((audio) =>
                        audiosSelecionados.includes(audio.chave)
                      )
                      .map((audio) => (
                        <div
                          key={audio.chave}
                          className="rounded-lg border border-zinc-700 p-3"
                        >
                          <p className="text-sm font-semibold text-white">
                            Áudio {audiosExistentes.indexOf(audio) + 1}
                          </p>

                          {item.referenciasAudios?.[audio.chave] && (
                            <p className="mt-2 break-words text-sm text-zinc-400">
                              {item.referenciasAudios[audio.chave]}
                            </p>
                          )}

                          <audio
                            controls
                            src={audio.url}
                            className="mt-3 w-full"
                            onPlay={(evento) => {
                              controlarReproducao(evento.currentTarget);
                            }}
                          >
                            Seu navegador não oferece suporte à reprodução de áudio.
                          </audio>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* REVISÃO — Links selecionados */}
              {linksSelecionados.length > 0 && (
                <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Links selecionados
                  </h3>

                  <div className="mt-3 space-y-3">
                    {[
                      ...(item.origem
                        ? [{ id: "origem", nome: "Origem", url: item.origem }]
                        : []),

                      ...(item.video
                        ? [{ id: "video", nome: "Vídeo", url: item.video }]
                        : []),

                      ...(item.links || []).map((link, indice) => ({
                        id: `link-${indice}`,
                        nome: `Link externo ${indice + 1}`,
                        url: link,
                      })),
                    ]
                      .filter((link) => linksSelecionados.includes(link.id))
                      .map((link) => (
                        <div
                          key={link.id}
                          className="rounded-lg border border-zinc-700 p-3"
                        >
                          <p className="text-sm font-semibold text-white">
                            {link.nome}
                          </p>

                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block break-all text-sm text-blue-400 underline"
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setRevisaoCompartilhamento(false)}
                    className="rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-purple-600"
                  >
                    ← Voltar à seleção
                  </button>
       
                  {/* COMPARTILHAR ITEM — Botão definitivo */}
                  <button
                    type="button"
                    onClick={testarCompartilhamentoCompleto}
                    className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    ↗ Compartilhar
                  </button>
                </div>

                {/* ORIENTAÇÃO DE COMPARTILHAMENTO — FASE INICIAL */}
                <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-sm text-zinc-300">
                  <p className="font-semibold text-zinc-200">
                    Compartilhamento — Fase inicial de testes
                  </p>

                  <p className="mt-2">
                    <strong>WhatsApp:</strong> até 10 imagens.
                    Para PDFs ou áudios, prefira grupos de até 2 arquivos
                    do mesmo tipo, separadamente.
                  </p>

                  <p className="mt-2">
                    <strong>Gmail:</strong> recomendado para pacotes mistos
                    de até 10 arquivos.
                  </p>
                </div>

              </div>
            )}

          </div>
         )}

        {item.descricao && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-sm font-semibold text-zinc-300">
              Descrição
            </h2>

            <p className="mt-2 max-h-[14rem] overflow-y-auto whitespace-pre-line break-words text-sm leading-relaxed text-zinc-300">
              {item.descricao}
            </p>
          </div>
        )}

      {/* ÁUDIOS DO ITEM */}
      {audiosExistentes.length > 0 && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-sm font-semibold text-zinc-300">
            Áudios do item
          </h2>

          <div className="mt-4 space-y-4">
            {audiosExistentes.map((audio, indice) => (
              <div key={audio.chave}>
                <p className="mb-2 text-xs text-zinc-400">
                  Gravação {indice + 1}
                </p>

                {item.referenciasAudios?.[audio.chave] && (
                  <p className="mb-3 text-sm text-white">
                    {item.referenciasAudios[audio.chave]}
                  </p>
                )}

                <audio
                  controls
                  src={audio.url}
                  className="w-full"
                  onPlay={(evento) => {
                    controlarReproducao(evento.currentTarget);
                  }}
                >
                  Seu navegador não oferece suporte à reprodução de áudio.
                </audio>
              </div>
            ))}
          </div>
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