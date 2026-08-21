export async function backupCompletoLocalStorage() {
  try {
    const dadosLocalStorage: Record<string, unknown> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);

      if (!chave) continue;

      // Não pertence aos dados do Receitas Health.
      if (chave === "ally-supports-cache") continue;

      const valor = localStorage.getItem(chave);

      if (valor === null) continue;

      try {
        dadosLocalStorage[chave] = JSON.parse(valor);
      } catch {
        dadosLocalStorage[chave] = valor;
      }
    }

    const backup = {
      app: "Receitas Health",
      tipo: "backup-completo-localstorage",
      versaoBackup: 1,
      exportadoEm: new Date().toISOString(),
      dados: dadosLocalStorage,
    };

    const resposta = await fetch(
      "/api/backup-localstorage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backup),
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(
        resultado.mensagem ||
          "Falha ao criar backup completo."
      );
    }

    return {
      sucesso: true,
      nomeArquivo: resultado.nomeArquivo,
      caminho: resultado.caminho,
    };
  } catch (erro) {
    console.error(
      "Erro no backup completo do LocalStorage:",
      erro
    );

    return {
      sucesso: false,
      nomeArquivo: "",
      caminho: "",
    };
  }
}