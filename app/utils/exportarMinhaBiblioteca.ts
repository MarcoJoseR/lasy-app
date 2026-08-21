type BackupReceitasHealthV1 = {
  app: "Receitas Health";
  tipo: "backup-minha-biblioteca";
  versaoBackup: 1;
  exportadoEm: string;
  dados: {
    receitas: unknown[];
    listasCompras: unknown[];
  };
};

export function exportarMinhaBiblioteca() {
  try {
    const receitasSalvas = localStorage.getItem("minhaBiblioteca");
    const listasSalvas = localStorage.getItem("listasCompras");

    const receitas = receitasSalvas ? JSON.parse(receitasSalvas) : [];
    const listasCompras = listasSalvas ? JSON.parse(listasSalvas) : [];

    // O backup do usuário leva somente suas receitas pessoais.
    // Receitas oficiais/Coleção Inicial não precisam ser transportadas.
    const receitasPessoais = Array.isArray(receitas)
      ? receitas.filter((receita) => receita?.tipo === "pessoal")
      : [];

    const backup: BackupReceitasHealthV1 = {
      app: "Receitas Health",
      tipo: "backup-minha-biblioteca",
      versaoBackup: 1,
      exportadoEm: new Date().toISOString(),

      dados: {
        receitas: receitasPessoais,
        listasCompras: Array.isArray(listasCompras) ? listasCompras : [],
      },
    };

    const conteudo = JSON.stringify(backup, null, 2);

    const blob = new Blob([conteudo], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const hoje = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `receitas-health-backup-${hoje}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return {
      sucesso: true,
      receitasExportadas: receitasPessoais.length,
      listasExportadas: Array.isArray(listasCompras)
        ? listasCompras.length
        : 0,
    };
  } catch (erro) {
    console.error("Erro ao exportar Minha Biblioteca:", erro);

    return {
      sucesso: false,
      receitasExportadas: 0,
      listasExportadas: 0,
    };
  }
}