export interface Tema {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ItemBiblioteca {
  id: string;
  temaId: string;

  titulo: string;
  descricao?: string;
  palavrasChave: string[];

  imagem?: string;
  chaveImagemCapa?: string;
  posicaoImagemY?: number;

  chaveImagens?: string;
  quantidadeImagens?: number;

  documentos?: {
  chaveDocumento: string;
  nomeDocumento: string;
  tipoDocumento?: string;
}[];

  origem?: string;
  video?: string;
  links?: string[];
  pastaLocal?: string;
  
  chaveAudio?: string;
  chavesAudios?: string[];
  referenciasAudios?: Record<string, string>;
  
  favorito?: boolean;
  emAcompanhamento?: boolean;

  criadoEm: string;
  atualizadoEm: string;
}