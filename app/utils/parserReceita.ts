export interface ReceitaParseada {
  nome: string;
  imagem: string;
  tempo: string;
  porcoes: string;
  categoria: string;
  subCategoria: string;
  ingredientes: string;
  modoPreparo: string;
}

function limparLinha(linha: string): string {
  return linha
    .replace(/[•]+/g, "")
    .replace(/^[*-]+/g, "")
    .replace("🧾", "")
    .replace("👨🍳", "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarTitulo(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function identificarCampo(linha: string): {
  campo: string;
  valorNaMesmaLinha: string;
} | null {
  const match = linha.match(
    /^(nome|categoria|subcategoria|ingredientes|modo de preparo|tempo|rendimento|imagem)\s*:\s*(.*)$/i
  );

  if (!match) return null;

  return {
    campo: normalizarTitulo(match[1]),
    valorNaMesmaLinha: limparLinha(match[2] || ""),
  };
}

function obterBlocos(texto: string) {
  const blocos: Record<string, string[]> = {};
  let campoAtual = "";

  texto.split("\n").forEach((linhaOriginal) => {
    let linha = limparLinha(linhaOriginal);
    if (!linha) return;

    linha = linha.replace(/^"+|"+$/g, "").trim();

    const campoIdentificado = identificarCampo(linha);

    if (campoIdentificado) {
      campoAtual = campoIdentificado.campo;
      blocos[campoAtual] = [];

      if (campoIdentificado.valorNaMesmaLinha) {
        blocos[campoAtual].push(campoIdentificado.valorNaMesmaLinha);
      }

      return;
    }

    if (campoAtual) {
      blocos[campoAtual].push(linha);
    }
  });

  return blocos;
}

function juntarBloco(blocos: Record<string, string[]>, campo: string): string {
  return (blocos[campo] || [])
    .map((linha) => linha.replace(/^"+|"+$/g, "").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function analisarReceitaColada(texto: string): ReceitaParseada {
  const blocos = obterBlocos(texto);

  return {
    nome: juntarBloco(blocos, "nome"),
    categoria: juntarBloco(blocos, "categoria") || "comida",
    subCategoria: juntarBloco(blocos, "subcategoria"),
    ingredientes: juntarBloco(blocos, "ingredientes"),
    modoPreparo: juntarBloco(blocos, "modo de preparo"),
    tempo: juntarBloco(blocos, "tempo"),
    porcoes: juntarBloco(blocos, "rendimento"),
    imagem: juntarBloco(blocos, "imagem"),
  };
}