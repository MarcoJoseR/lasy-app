export interface DiagnosticoArmazenamento {
  suportado: boolean;
  persistente: boolean | null;
  usoBytes: number | null;
  cotaBytes: number | null;
  usoMB: number | null;
  cotaMB: number | null;
  percentualUso: number | null;
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