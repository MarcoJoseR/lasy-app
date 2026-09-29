export interface DadosFormularioItem {
  titulo: string;
  descricao: string;
  palavrasChave: string;
  origem: string;
  video: string;
  links: string[];
}

export function prepararDadosFormularioItem(
  dados: DadosFormularioItem
) {
  const titulo = dados.titulo.trim();

  const palavrasChave = dados.palavrasChave
    .split(",")
    .map((palavra) => palavra.trim())
    .filter(Boolean);

  const links = dados.links
    .map((link) => link.trim())
    .filter(Boolean);

  return {
    titulo,
    descricao:
      dados.descricao.trim() || undefined,
    palavrasChave,
    origem:
      dados.origem.trim() || undefined,
    video:
      dados.video.trim() || undefined,
    links,
  };
}