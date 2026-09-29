export function reduzirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const limite = 1600;

        let largura = imagem.width;
        let altura = imagem.height;

        if (largura > limite || altura > limite) {
          const proporcao = Math.min(
            limite / largura,
            limite / altura
          );

          largura = Math.round(
            largura * proporcao
          );

          altura = Math.round(
            altura * proporcao
          );
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto =
          canvas.getContext("2d");

        if (!contexto) {
          reject(
            new Error(
              "Não foi possível processar a imagem."
            )
          );

          return;
        }

        contexto.imageSmoothingEnabled = true;
        contexto.imageSmoothingQuality = "high";

        contexto.drawImage(
          imagem,
          0,
          0,
          largura,
          altura
        );

        const resultado =
          canvas.toDataURL(
            "image/jpeg",
            0.82
          );

        resolve(resultado);
      };

      imagem.onerror = () => {
        reject(
          new Error(
            "Não foi possível carregar a imagem."
          )
        );
      };

      imagem.src =
        String(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Não foi possível ler o arquivo."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}