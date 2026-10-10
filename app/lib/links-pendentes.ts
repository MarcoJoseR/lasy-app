
const CHAVE_LINKS_PENDENTES = "healthLinksPendentes";

export interface LinkPendente {
  id: string;
  titulo: string;
  url: string;
  criadoEm: string;
  status: "pendente";
}

// Listar os links armazenados
export function listarLinksPendentes(): LinkPendente[] {
  if (typeof window === "undefined") return [];

  try {
    const dados = localStorage.getItem(CHAVE_LINKS_PENDENTES);
    if (!dados) return [];

    const lista = JSON.parse(dados);
    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    console.error("Erro ao ler links pendentes:", erro);
    return [];
  }
}

// Salvar um novo link
export function salvarLinkPendente(
  url: string,
  titulo = ""
): LinkPendente {
  if (typeof window === "undefined") {
    throw new Error("Armazenamento indisponível.");
  }

  const urlLimpa = url.trim();

  if (!/^https?:\/\/\S+$/i.test(urlLimpa)) {
    throw new Error("Informe um link HTTP ou HTTPS válido.");
  }

  const novoLink: LinkPendente = {
    id: crypto.randomUUID(),
    titulo: titulo.trim(),
    url: urlLimpa,
    criadoEm: new Date().toISOString(),
    status: "pendente",
  };

  const linksAtuais = listarLinksPendentes();

  localStorage.setItem(
    CHAVE_LINKS_PENDENTES,
    JSON.stringify([novoLink, ...linksAtuais])
  );

  return novoLink;
}

// Excluir um link pendente
export function excluirLinkPendente(id: string): void {
  if (typeof window === "undefined") return;

  const links = listarLinksPendentes();
  const novaLista = links.filter((link) => link.id !== id);

  localStorage.setItem(
    CHAVE_LINKS_PENDENTES,
    JSON.stringify(novaLista)
  );
}
