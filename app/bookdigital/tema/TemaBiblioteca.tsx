"use client";

import { useEffect, useRef, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

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
  toggleAcompanhamentoItem,
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
  salvarAudio,
  obterAudio,
  removerAudio,
} from "@/app/lib/bookdigital-audios";

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

interface TemaBibliotecaProps {
  temaId: string;
}

export default function TemaBiblioteca({
  temaId,
}: TemaBibliotecaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tituloRecebido = searchParams.get("titulo") || "";
  const linkRecebido = searchParams.get("link") || "";

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
  const importacaoLinkIniciada = useRef(false);

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

  const [capasCarregadas, setCapasCarregadas] =
    useState(false);

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

  // ============================================================
  // ÁUDIO DO ITEM
  // ============================================================

  const [audioGravado, setAudioGravado] =
    useState<Blob | null>(null);

  const [referenciaNovoAudio, setReferenciaNovoAudio] =
    useState("");

  const [urlAudioGravado, setUrlAudioGravado] = useState<string | null>(null);

useEffect(() => {
  if (!audioGravado) {
    setUrlAudioGravado(null);
    return;
  }

  const url = URL.createObjectURL(audioGravado);
  setUrlAudioGravado(url);

  return () => {
    URL.revokeObjectURL(url);
  };
}, [audioGravado]);

  const [gravandoAudio, setGravandoAudio] =
    useState(false);

  const [audioPausado, setAudioPausado] =
    useState(false);

  const [finalizandoAudio, setFinalizandoAudio] =
    useState(false);

  const finalizandoAudioRef = useRef(false);

  const [chaveAudio, setChaveAudio] =
    useState<string | null>(null);

  const [audiosExistentes, setAudiosExistentes] = useState<
    { chave: string; url: string; referencia?: string }[]
  >([]);

  const [chavesAudiosExcluir, setChavesAudiosExcluir] =
  useState<string[]>([]);

  const carregamentoAudiosRef = useRef(0);

  const urlsAudiosExistentesRef = useRef<string[]>([]);

    // ============================================================
  // CONTROLE DO GRAVADOR DE ÁUDIO
  // ============================================================

  const gravadorRef =
    useRef<MediaRecorder | null>(null);

  const microfoneRef =
    useRef<MediaStream | null>(null);

  const partesAudioRef =
    useRef<Blob[]>([]);  

  // ============================================================
  // CONTROLE DE CANCELAMENTO DO ÁUDIO
  // ============================================================

  const cancelarAudioRef = useRef(false);

  const solicitacaoMicrofoneRef = useRef(0);

  const solicitandoMicrofoneRef = useRef(false);

  const [itemEditandoId, setItemEditandoId] =
    useState<string | null>(null);

  const [temaDestinoId, setTemaDestinoId] = useState("");
  const [todosTemas, setTodosTemas] = useState<Tema[]>([]);

  const [links, setLinks] = useState<string[]>([""]);

  const [ordenacao, setOrdenacao] = useState<
    "recentes" | "antigos" | "titulo"
  >("recentes");

function iniciarNovoItem(
  tituloInicial = "",
  linkInicial = ""
) {
  cancelarGravacaoAudio();
  limparAudiosExistentes();
  setItemEditandoId(null);
  setTitulo(tituloInicial);
  setDescricao("");
  setPalavrasChave("");
  setOrigem(linkInicial);
  setVideo("");
  setLinks([""]);

  setImagemCapa("");
  setImagemCapaAtual("");
  setPosicaoImagemY(50);

  setImagensItem([]);
  setChaveImagens("");

  setDocumentos([]);

  setAudioGravado(null);
  setGravandoAudio(false);
  setChaveAudio(null);

  setTemaDestinoId(temaId);

  setErro("");
  setMostrarFormulario(true);
}

// ============================================================
// ABRIR NOVO ITEM RECEBIDO DOS LINKS PENDENTES
// ============================================================

useEffect(() => {
  if (!linkRecebido || !temaId) return;

  if (importacaoLinkIniciada.current) return;

  importacaoLinkIniciada.current = true;

  iniciarNovoItem(tituloRecebido, linkRecebido);

  // Retira os dados de importação da URL,
  // preservando o identificador do Tema.
  const url = new URL(window.location.href);

  url.searchParams.delete("titulo");
  url.searchParams.delete("link");

  window.history.replaceState(
    window.history.state,
    "",
    url.pathname + url.search + url.hash
  );
}, [temaId, tituloRecebido, linkRecebido]);

async function iniciarGravacaoAudio() {
  if (
    gravadorRef.current ||
    gravandoAudio ||
    solicitandoMicrofoneRef.current
  ) {
    return;
  }

  solicitandoMicrofoneRef.current = true;

  const numeroSolicitacao =
    ++solicitacaoMicrofoneRef.current;

  cancelarAudioRef.current = false;

  try {
    setErro("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setErro(
        "A gravação de áudio não está disponível neste navegador."
      );
      return;
    }

    const microfone =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      solicitandoMicrofoneRef.current = false;

    // Verifica se a solicitação foi cancelada
    // enquanto aguardava a permissão.

    if (
      cancelarAudioRef.current ||
      numeroSolicitacao !==
        solicitacaoMicrofoneRef.current
    ) {
      microfone.getTracks().forEach(
        (trilha) => trilha.stop()
      );
      return;
    }

    setReferenciaNovoAudio("");

    microfoneRef.current = microfone;
    partesAudioRef.current = [];

    const formatoAudio =
      MediaRecorder.isTypeSupported(
        "audio/mp4;codecs=mp4a.40.2"
      )
        ? "audio/mp4;codecs=mp4a.40.2"
        : undefined;

    const gravador = new MediaRecorder(
      microfone,
      formatoAudio
        ? { mimeType: formatoAudio }
        : undefined
    );

// DIAGNÓSTICO — Formato efetivo da gravação
console.log("FORMATO DO GRAVADOR:", {
  formatoSolicitado: formatoAudio,
  formatoEfetivo: gravador.mimeType,
});

    gravadorRef.current = gravador;

    gravador.ondataavailable = (evento) => {
      if (evento.data.size > 0) {
        partesAudioRef.current.push(
          evento.data
        );
      }
    };
        
    gravador.onstop = () => {
      const partes = partesAudioRef.current;

      const gravacaoValida =
        !cancelarAudioRef.current &&
        gravadorRef.current === gravador &&
        partes.length > 0;

      if (gravacaoValida) {
        const audio = new Blob(partes, {
          type:
            gravador.mimeType ||
            partes[0].type ||
            "audio/webm",
        });

        setAudioGravado(audio);
      }

      // Libera o microfone desta gravação.
      microfone.getTracks().forEach(
        (trilha) => trilha.stop()
      );

      // Evita que um gravador antigo
      // altere uma gravação mais recente.
      if (gravadorRef.current === gravador) {
        microfoneRef.current = null;
        gravadorRef.current = null;
        partesAudioRef.current = [];

        finalizandoAudioRef.current = false;
        setFinalizandoAudio(false);
        setGravandoAudio(false);
        setAudioPausado(false);

        if (
          !cancelarAudioRef.current &&
          !gravacaoValida
        ) {
          setErro(
            "A gravação terminou sem produzir áudio."
          );
        }
      }
    };

    gravador.onerror = () => {
      // Libera o microfone
      microfone.getTracks().forEach(
        (trilha) => trilha.stop()
      );

      // Limpa apenas o gravador correspondente
      if (gravadorRef.current === gravador) {
        microfoneRef.current = null;
        gravadorRef.current = null;
        partesAudioRef.current = [];

        // Libera o controle de finalização
        finalizandoAudioRef.current = false;
        setFinalizandoAudio(false);

        setGravandoAudio(false);
        setAudioGravado(null);

        setErro(
          "Ocorreu um erro durante a gravação. Tente novamente."
        );
      }
    };
    
    gravador.start();

    setAudioPausado(false);
    setFinalizandoAudio(false);
    finalizandoAudioRef.current = false;

    setGravandoAudio(true);

  } catch (error) {
    if (
      numeroSolicitacao !==
      solicitacaoMicrofoneRef.current
    ) {
      return;
    }

    microfoneRef.current
      ?.getTracks()
      .forEach((trilha) => trilha.stop());

    microfoneRef.current = null;
    gravadorRef.current = null;
    partesAudioRef.current = [];

    setGravandoAudio(false);

    if (!cancelarAudioRef.current) {
      setErro(
        "Não foi possível iniciar a gravação. Verifique a permissão do microfone."
      );
    }
    } finally {
    if (
      numeroSolicitacao ===
      solicitacaoMicrofoneRef.current
    ) {
      solicitandoMicrofoneRef.current = false;
    }
  }
}

// ============================================================
// PARAR GRAVAÇÃO DE ÁUDIO
// ============================================================

function pararGravacaoAudio() {
  const gravador = gravadorRef.current;

  if (!gravador) {
    return;
  }

  if (
    gravador.state === "recording" ||
    gravador.state === "paused"
  ) {
    try {
      // Bloqueia o salvamento enquanto
      // o arquivo está sendo finalizado.
      finalizandoAudioRef.current = true;
      setFinalizandoAudio(true);

      gravador.stop();
    } catch (error) {
      console.error(
        "Erro ao parar a gravação:",
        error
      );

      microfoneRef.current
        ?.getTracks()
        .forEach((trilha) => trilha.stop());

      microfoneRef.current = null;
      gravadorRef.current = null;
      partesAudioRef.current = [];

      finalizandoAudioRef.current = false;
      setFinalizandoAudio(false);
      setGravandoAudio(false);

      setErro(
        "Não foi possível finalizar a gravação."
      );
    }
  }
}

// ============================================================
// PAUSAR GRAVAÇÃO
// ============================================================

function pausarGravacaoAudio() {
  const gravador = gravadorRef.current;

  if (!gravador || gravador.state !== "recording") {
    return;
  }

  try {
    gravador.pause();
    setAudioPausado(true);
    setGravandoAudio(false);
  } catch (error) {
    console.error("Erro ao pausar gravação:", error);
    setErro("Não foi possível pausar a gravação.");
  }
}

// ============================================================
// CONTINUAR GRAVAÇÃO
// ============================================================

function continuarGravacaoAudio() {
  const gravador = gravadorRef.current;

  if (!gravador || gravador.state !== "paused") {
    return;
  }

  try {
    gravador.resume();
    setAudioPausado(false);
    setGravandoAudio(true);
  } catch (error) {
    console.error("Erro ao continuar gravação:", error);
    setErro("Não foi possível continuar a gravação.");
  }
}

 // ============================================================
 // CANCELAR GRAVAÇÃO DE ÁUDIO
 // ============================================================

function cancelarGravacaoAudio() {
  // Invalida solicitações de microfone pendentes.
  solicitacaoMicrofoneRef.current += 1;

  // Impede que o áudio seja guardado ao parar.
  cancelarAudioRef.current = true;
  solicitandoMicrofoneRef.current = false;

  const gravador = gravadorRef.current;

  if (gravador && gravador.state !== "inactive") {
    try {
      gravador.stop();
    } catch (error) {
      console.error(
        "Erro ao cancelar gravação:",
        error
      );
    }
  }

  // Libera o microfone.
  microfoneRef.current
    ?.getTracks()
    .forEach((trilha) => trilha.stop());

  microfoneRef.current = null;
  gravadorRef.current = null;
  partesAudioRef.current = [];

  finalizandoAudioRef.current = false;
  setFinalizandoAudio(false);

  setGravandoAudio(false);
  setAudioPausado(false);
  setAudioGravado(null);
}

  function limparFormularioItem() {
  setChavesAudiosExcluir([]);
  
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

  setAudioGravado(null);
  setReferenciaNovoAudio("");
  setGravandoAudio(false);
  setChaveAudio(null);

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

      setCapasCarregadas(false);
      setItens(itensDoTema);
      void carregarCapas(itensDoTema);
    } else {
      setCapasCarregadas(true);
    }

    setCarregando(false);
  }, [temaId]);

useEffect(() => {
  if (carregando || !capasCarregadas) return;

  const retornoSalvo = sessionStorage.getItem(
    "bookdigitalCardRetorno"
  );

  if (!retornoSalvo) return;

  let retorno;

  try {
    retorno = JSON.parse(retornoSalvo);
  } catch {
    sessionStorage.removeItem(
      "bookdigitalCardRetorno"
    );
    return;
  }

  if (retorno.temaId !== temaId) return;

  const cardId = `card-item-${retorno.itemId}`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const card = document.getElementById(cardId);

      if (card) {
        card.scrollIntoView({
          behavior: "auto",
          block: "center",
        });

        sessionStorage.removeItem(
          "bookdigitalCardRetorno"
        );
      }
    });
  });
}, [carregando, capasCarregadas, temaId, itens]);

  // ============================================================
  // LIBERAR MICROFONE AO SAIR DO TEMA
  // ============================================================

  useEffect(() => {
    return () => {
      // Invalida permissões de microfone pendentes.
      solicitacaoMicrofoneRef.current += 1;
      cancelarAudioRef.current = true;

      const gravador = gravadorRef.current;

      if (gravador) {
        gravador.ondataavailable = null;
        gravador.onstop = null;
        gravador.onerror = null;

        if (gravador.state !== "inactive") {
          try {
            gravador.stop();
          } catch (error) {
            console.error(
              "Erro ao encerrar gravador:",
              error
            );
          }
        }
      }

      microfoneRef.current
        ?.getTracks()
        .forEach((trilha) => trilha.stop());

      microfoneRef.current = null;
      gravadorRef.current = null;
      partesAudioRef.current = [];
    };
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
 setCapasCarregadas(true);
}

  async function adicionarItem() {
    try {
      setErro("");

    const temaExiste = listarTemas().some(
      (tema) => tema.id === temaId
    );

    if (!temaExiste) {
      setErro(
        "Não foi possível encontrar este Tema. " +
        "O Item não foi salvo para proteger seus dados."
      );
      return;
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

// ============================================================
// SALVAR ÁUDIO DO NOVO ITEM
// ============================================================

let chaveAudioSalvo: string | undefined;

if (
  gravandoAudio ||
  audioPausado ||
  gravadorRef.current !== null ||
  solicitandoMicrofoneRef.current ||
  finalizandoAudioRef.current
) {
  setErro(
    "Finalize a gravação de áudio antes de salvar o item."
  );
  return;
}

if (audioGravado) {
  chaveAudioSalvo = crypto.randomUUID();

  await salvarAudio(
    chaveAudioSalvo,
    audioGravado
  );
}

      const novoItem = criarItem({
        temaId,
        titulo: dadosFormulario.titulo,
        descricao: dadosFormulario.descricao,
        palavrasChave: dadosFormulario.palavrasChave,
        origem: dadosFormulario.origem,
        video: dadosFormulario.video,
        links: dadosFormulario.links,

        // ÁUDIO DO NOVO ITEM
        chaveAudio: chaveAudioSalvo,

        chavesAudios: chaveAudioSalvo
          ? [chaveAudioSalvo]
          : undefined,

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

      // Limpar áudio provisório após salvar
      setAudioGravado(null);
      setChaveAudio(null);

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

// ============================================================
// ALTERNAR ACOMPANHAMENTO DO ITEM
// ============================================================

function alternarAcompanhamento(itemId: string) {
  try {
    const itemAtualizado =
      toggleAcompanhamentoItem(itemId);

    setItens((anteriores) =>
      anteriores.map((item) =>
        item.id === itemId
          ? itemAtualizado
          : item
      )
    );
  } catch (error) {
    console.error(
      "Erro ao alterar acompanhamento:",
      error
    );
  }
}

function limparAudiosExistentes() {
  // Invalida carregamentos ainda em andamento.
  carregamentoAudiosRef.current += 1;

  // Libera os endereços temporários.
  urlsAudiosExistentesRef.current.forEach((url) => {
    URL.revokeObjectURL(url);
  });

  urlsAudiosExistentesRef.current = [];
  setAudiosExistentes([]);
}

async function carregarAudiosExistentes(item: ItemBiblioteca) {
  const numeroCarregamento = ++carregamentoAudiosRef.current;

  // Libera os endereços do item anterior.
  urlsAudiosExistentesRef.current.forEach((url) => {
    URL.revokeObjectURL(url);
  });

  urlsAudiosExistentesRef.current = [];
  setAudiosExistentes([]);

  const chaves = [...new Set([
    ...(item.chaveAudio ? [item.chaveAudio] : []),
    ...(item.chavesAudios ?? []),
  ])];

  const audiosCarregados: {
  chave: string;
  url: string;
  referencia?: string;
}[] = [];

  try {
    for (const chave of chaves) {
      const arquivo = await obterAudio(chave);

     if (numeroCarregamento !== carregamentoAudiosRef.current) {
        break;
      }

      if (!arquivo) continue;

      const url = URL.createObjectURL(arquivo);

      audiosCarregados.push({
        chave,
        url,
        referencia: item.referenciasAudios?.[chave] ?? "",
      });
    }

    if (numeroCarregamento === carregamentoAudiosRef.current) {
      urlsAudiosExistentesRef.current =
        audiosCarregados.map((audio) => audio.url);
      
    setAudiosExistentes(audiosCarregados);
    } else {
      audiosCarregados.forEach((audio) => {
        URL.revokeObjectURL(audio.url);
      });
    }
  } catch (error) {
    audiosCarregados.forEach((audio) => {
      URL.revokeObjectURL(audio.url);
    });

    console.error("Erro ao carregar áudios:", error);

    if (numeroCarregamento === carregamentoAudiosRef.current) {
      setErro("Não foi possível carregar os áudios deste item.");
    }
  }
}

function iniciarEdicao(item: ItemBiblioteca) {
  cancelarGravacaoAudio();
  
  setChavesAudiosExcluir([]);

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

  // ÁUDIO DO ITEM
  setAudioGravado(null);
  setGravandoAudio(false);
  setChaveAudio(item.chaveAudio ?? null);

  setMostrarFormulario(true);
  setErro("");

  void carregarAudiosExistentes(item);
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

  // ============================================================
  // PREPARAR ÁUDIOS DO ITEM
  // ============================================================

      if (
      gravandoAudio ||
      solicitandoMicrofoneRef.current ||
      gravadorRef.current ||
      finalizandoAudioRef.current
    ) {
    setErro(
      "Finalize a gravação antes de salvar o item."
    );
    return false;
  }

  const chavesAudiosExistentes = [
    ...new Set([
      ...(itemAtual?.chaveAudio
        ? [itemAtual.chaveAudio]
        : []),
      ...(itemAtual?.chavesAudios ?? []),
    ]),
  ];

  let chaveNovoAudio: string | undefined;

  if (audioGravado) {
    chaveNovoAudio = crypto.randomUUID();

    await salvarAudio(
      chaveNovoAudio,
      audioGravado
    );
  }

  const chavesAudiosMantidas =
  chavesAudiosExistentes.filter(
    (chave) => !chavesAudiosExcluir.includes(chave)
  );

  const chavesAudiosFinais = chaveNovoAudio
    ? [...chavesAudiosMantidas, chaveNovoAudio]
    : chavesAudiosMantidas;

  const referenciasAudiosAtualizadas: Record<string, string> = {
    ...(itemAtual?.referenciasAudios ?? {}),
  };

  audiosExistentes.forEach((audio) => {
    referenciasAudiosAtualizadas[audio.chave] =
      audio.referencia ?? "";
  });

  if (chaveNovoAudio) {
    referenciasAudiosAtualizadas[chaveNovoAudio] =
      referenciaNovoAudio.trim();
  }

  chavesAudiosExcluir.forEach((chave) => {
    delete referenciasAudiosAtualizadas[chave];
  });

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

      // ÁUDIOS DO ITEM
      chaveAudio:
        chavesAudiosFinais[0] ?? undefined,

      chavesAudios:
        chavesAudiosFinais.length > 0
          ? chavesAudiosFinais
          : undefined,

      referenciasAudios: referenciasAudiosAtualizadas,

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

  // EXCLUSÃO DEFINITIVA DOS ÁUDIOS
  // Remover arquivos dos áudios excluídos,
  // após atualizar os dados do item.
  for (const chave of chavesAudiosExcluir) {
    try {
      await removerAudio(chave);
    } catch (error) {
      console.error(
        "Erro ao remover áudio do IndexedDB:",
        error
      );

      setErro(
        "O item foi atualizado, mas não foi possível remover " +
        "um dos arquivos de áudio do dispositivo."
      );

    return false;
  }
}

  return true;
}

function voltarAoCard(itemId: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const card = document.getElementById(
        `card-item-${itemId}`
      );

      card?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    });
  });
}

async function salvarEdicao() {
  const itemId = itemEditandoId;

  const salvou =
    await salvarDadosEdicaoAtual();

  if (!salvou) {
    return false;
  }

  limparFormularioItem();
  setMostrarFormulario(false);

  if (itemId) {
    voltarAoCard(itemId);
  }

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
              cancelarGravacaoAudio();
              limparAudiosExistentes();
              limparFormularioItem();
              setMostrarFormulario(false);
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
                const itemId = itemEditandoId;

                cancelarGravacaoAudio();
                limparAudiosExistentes();
                limparFormularioItem();
                setMostrarFormulario(false);

                if (itemId) {
                  voltarAoCard(itemId);
                }
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

        {/* ============================================= */}
        {/* ÁUDIO DO ITEM                                  */}
        {/* ============================================= */}

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="font-semibold text-white">
            Áudio do item
          </p>

          <p className="mt-1 text-sm text-zinc-400">
            Grave informações e acrescente complementos
            ao seu item.
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            Gravações armazenadas no dispositivo.
          </p>

         {gravandoAudio && (
          <p className="mt-3 text-sm font-semibold text-red-400">
            🔴 Gravando áudio...
          </p>
        )}

        {audioPausado && (
          <p className="mt-3 text-sm font-semibold text-amber-400">
            ⏸️ Gravação pausada
          </p>
        )}

          <button
            type="button"
            onClick={iniciarGravacaoAudio}
            disabled={
              gravandoAudio ||
              audioPausado ||
              finalizandoAudio
            }
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            🎙️ Gravar áudio
          </button>

        {gravandoAudio && (
          <button
            type="button"
            onClick={pausarGravacaoAudio}
            className="ml-2 mt-4 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white"
          >
            ⏸️ Pausar
          </button>
        )}

        {audioPausado && (
          <button
            type="button"
            onClick={continuarGravacaoAudio}
            className="ml-2 mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            ▶️ Continuar
          </button>
        )}

        {(gravandoAudio || audioPausado) && (
          <button
            type="button"
            onClick={pararGravacaoAudio}
            disabled={finalizandoAudio}
            className="ml-2 mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            ⏹️ Parar
          </button>
        )}

        {finalizandoAudio && (
          <p className="mt-3 text-sm text-amber-400">
            Finalizando gravação...
          </p>
        )}

        {audioGravado && !finalizandoAudio && (
          <p className="mt-3 text-sm text-green-400">
            ✅ Áudio gravado. Pronto para ouvir e salvar.
          </p>
        )}
        </div>
          
          {audiosExistentes.length > 0 && (

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-zinc-300">
                Áudios salvos
              </p>

              {audiosExistentes
                .filter((audio) => !chavesAudiosExcluir.includes(audio.chave))
                .map((audio, indice) => (
                
                <div key={audio.chave}>
                  <p className="mb-2 text-xs text-zinc-400">
                    Gravação {indice + 1}
                  </p>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmar = window.confirm(
                          "Deseja excluir esta gravação de áudio?"
                        );

                        if (!confirmar) return;

                        setChavesAudiosExcluir((anteriores) =>
                          [...new Set([...anteriores, audio.chave])]
                        );
                      }}
                      className="mb-3 rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Excluir áudio
                    </button>

                  <input
                    type="text"
                    maxLength={80}
                    placeholder="Referência sobre este áudio"
                    value={audio.referencia ?? ""}
                    onChange={(e) => {
                      const novaReferencia = e.target.value;

                      setAudiosExistentes((anteriores) =>
                        anteriores.map((atual) =>
                          atual.chave === audio.chave
                            ? { ...atual, referencia: novaReferencia }
                            : atual
                        )
                      );
                    }}
                    className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                  />
                  <audio
                    controls
                    src={audio.url}
                    className="w-full"
                    onPlay={(evento) => {
                      const audioAtual = evento.currentTarget;

                      document.querySelectorAll("audio").forEach((outroAudio) => {
                        if (outroAudio !== audioAtual) {
                          outroAudio.pause();
                        }
                      });
                    }}
                  >
                    Seu navegador não oferece suporte à reprodução de áudio.
                  </audio>
                </div>
              ))}
            </div>
          )}

            {audioGravado && urlAudioGravado && !finalizandoAudio && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-zinc-400">
                  Nova gravação
                </p>

                <input
                  type="text"
                  maxLength={80}
                  placeholder="Referência sobre este áudio"
                  value={referenciaNovoAudio}
                  onChange={(e) => setReferenciaNovoAudio(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                />

                <audio
                  controls
                  src={urlAudioGravado}
                  className="w-full"
                >
                  Seu navegador não oferece suporte à reprodução de áudio.
                </audio>
              </div>
            )}

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
                id={`card-item-${item.id}`}

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
                  <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-sm text-zinc-400">
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
                    onClick={() => {
                      const destino = navigator.onLine
                        ? `/bookdigital/item/${item.id}`
                        : `/bookdigital/item/offline?id=${encodeURIComponent(item.id)}`;

                      window.location.assign(destino);
                    }}

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

                  <button
                    type="button"
                    onClick={() => alternarAcompanhamento(item.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    {item.emAcompanhamento
                      ? "✓ Acompanhando"
                      : "○ Acompanhar"}
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