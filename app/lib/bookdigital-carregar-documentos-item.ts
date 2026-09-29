import { obterDocumento } from "@/app/lib/bookdigital-arquivos";

interface DocumentoSalvo {
  chaveDocumento: string;
  nomeDocumento: string;
  tipoDocumento?: string;
}

export async function carregarDocumentosItemParaEdicao(
  documentosSalvos?: DocumentoSalvo[]
): Promise<File[]> {
  if (!documentosSalvos?.length) {
    return [];
  }

  try {
    const arquivos = await Promise.all(
      documentosSalvos.map(
        async (documentoSalvo) => {
          const blob = await obterDocumento(
            documentoSalvo.chaveDocumento
          );

          if (!blob) {
            return null;
          }

          return new File(
            [blob],
            documentoSalvo.nomeDocumento,
            {
              type:
                documentoSalvo.tipoDocumento ||
                blob.type ||
                "application/octet-stream",
            }
          );
        }
      )
    );

    return arquivos.filter(
      (arquivo): arquivo is File =>
        arquivo !== null
    );
  } catch (erro) {
    console.error(
      "Erro ao carregar documentos do item:",
      erro
    );

    return [];
  }
}