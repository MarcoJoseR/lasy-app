export interface DiagnosticoArmazenamento {
  suportado: boolean;
  persistente: boolean | null;
  usoBytes: number | null;
  cotaBytes: number | null;
  usoMB: number | null;
  cotaMB: number | null;
  percentualUso: number | null;
  espacoLivreBytes: number | null;
  espacoLivreMB: number | null;
}

export async function diagnosticarArmazenamento(): Promise<DiagnosticoArmazenamento> {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage
  ) {
    return {
      suportado: false,
      persistente: null,
      usoBytes: null,
      cotaBytes: null,
      usoMB: null,
      cotaMB: null,
      percentualUso: null,
      espacoLivreBytes: null,
      espacoLivreMB: null,
    };
  }

  try {
    const estimativa = await navigator.storage.estimate();

    let persistente: boolean | null = null;

    if (navigator.storage.persisted) {
      persistente = await navigator.storage.persisted();
    }

    const usoBytes =
      typeof estimativa.usage === "number"
        ? estimativa.usage
        : null;

    const cotaBytes =
      typeof estimativa.quota === "number"
        ? estimativa.quota
        : null;

    const usoMB =
      usoBytes !== null
        ? usoBytes / 1024 / 1024
        : null;

    const cotaMB =
      cotaBytes !== null
        ? cotaBytes / 1024 / 1024
        : null;

    const espacoLivreBytes =
      usoBytes !== null &&
      cotaBytes !== null
        ? Math.max(cotaBytes - usoBytes, 0)
        : null;

    const espacoLivreMB =
      espacoLivreBytes !== null
        ? espacoLivreBytes / 1024 / 1024
        : null;

    const percentualUso =
      usoBytes !== null &&
      cotaBytes !== null &&
      cotaBytes > 0
        ? (usoBytes / cotaBytes) * 100
        : null;

    return {
      suportado: true,
      persistente,
      usoBytes,
      cotaBytes,
      usoMB,
      cotaMB,
      percentualUso,
      espacoLivreBytes,
      espacoLivreMB,
    };
  } catch (erro) {
    console.error(
      "Erro ao diagnosticar armazenamento:",
      erro
    );

    return {
      suportado: true,
      persistente: null,
      usoBytes: null,
      cotaBytes: null,
      usoMB: null,
      cotaMB: null,
      percentualUso: null,
      espacoLivreBytes: null,
      espacoLivreMB: null,
    };
  }
}

export async function solicitarPersistenciaArmazenamento(): Promise<boolean | null> {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage ||
    !navigator.storage.persist
  ) {
    return null;
  }

  try {
    const jaPersistente =
      navigator.storage.persisted
        ? await navigator.storage.persisted()
        : false;

    if (jaPersistente) {
      return true;
    }

    const concedido =
      await navigator.storage.persist();

    return concedido;
  } catch (erro) {
    console.error(
      "Erro ao solicitar persistência do armazenamento:",
      erro
    );

    return false;
  }
}

export type EstadoArmazenamento =
  | "normal"
  | "alerta"
  | "indisponivel";

export function avaliarEstadoArmazenamento(
  diagnostico: DiagnosticoArmazenamento
): EstadoArmazenamento {
  if (
    !diagnostico.suportado ||
    diagnostico.espacoLivreMB === null ||
    diagnostico.percentualUso === null
  ) {
    return "indisponivel";
  }

  if (
    diagnostico.espacoLivreMB < 200 ||
    diagnostico.percentualUso >= 85
  ) {
    return "alerta";
  }

  return "normal";
}

export function mensagemEstadoArmazenamento(
  estado: EstadoArmazenamento
): string {
  if (estado === "alerta") {
    return "⚠️ Espaço de armazenamento reduzido. Faça um backup antes de adicionar novos conteúdos.";
  }

  if (estado === "normal") {
    return "✅ Armazenamento em condições normais.";
  }

  return "Armazenamento não pôde ser verificado neste navegador.";
}
