interface SecaoDadosGeraisProps {
  nome: string;
  setNome: React.Dispatch<React.SetStateAction<string>>;
  imagem: string;
  setImagem: React.Dispatch<React.SetStateAction<string>>;
  // ===== INÍCIO DA ALTERAÇÃO =====
  permitirUploadImagem?: boolean;
  // ===== FIM DA ALTERAÇÃO =====

  erroNome: string;
  setErroNome: React.Dispatch<React.SetStateAction<string>>;
  limparTexto: (texto: string) => string;
  inputClassBase: string;
  inputError: string;
}

export default function SecaoDadosGerais({
  nome,
  setNome,
  imagem,
  setImagem,
  erroNome,
  setErroNome,
  limparTexto,
  inputClassBase,
  inputError,
  permitirUploadImagem = false,
}: SecaoDadosGeraisProps) {

// ===== INÍCIO DA ALTERAÇÃO =====
function handleSelecionarImagem(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const arquivo = event.target.files?.[0];

  if (!arquivo) {
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    window.alert("Selecione um arquivo de imagem.");
    return;
  }

  const leitor = new FileReader();

  leitor.onload = () => {
    const imagemOriginal = new Image();

    imagemOriginal.onload = () => {
      const tamanhoMaximo = 1000;

      let largura = imagemOriginal.width;
      let altura = imagemOriginal.height;

      if (largura > altura && largura > tamanhoMaximo) {
        altura = Math.round(
          altura * (tamanhoMaximo / largura)
        );
        largura = tamanhoMaximo;
      } else if (
        altura >= largura &&
        altura > tamanhoMaximo
      ) {
        largura = Math.round(
          largura * (tamanhoMaximo / altura)
        );
        altura = tamanhoMaximo;
      }

      const canvas = document.createElement("canvas");

      canvas.width = largura;
      canvas.height = altura;

      const contexto = canvas.getContext("2d");

      if (!contexto) {
        return;
      }

      contexto.drawImage(
        imagemOriginal,
        0,
        0,
        largura,
        altura
      );

      let qualidade = 0.8;
      let imagemCompactada = canvas.toDataURL(
        "image/jpeg",
        qualidade
      );

      const limiteAproximado = 400 * 1024;

      while (
        imagemCompactada.length > limiteAproximado * 1.35 &&
        qualidade > 0.45
      ) {
        qualidade -= 0.05;

        imagemCompactada = canvas.toDataURL(
          "image/jpeg",
          qualidade
        );
      }

      setImagem(imagemCompactada);
    };

    imagemOriginal.src = String(leitor.result);
  };

  leitor.readAsDataURL(arquivo);
}
// ===== FIM DA ALTERAÇÃO =====

  return (
    <>
      <h3 className="mb-4 text-lg font-bold text-zinc-900">
        📋 Dados Gerais
      </h3>

      <div className="mb-3">
        <label className="text-sm font-medium text-zinc-700">
          Nome
        </label>

        <input
          placeholder="Ex: Bolo de chocolate"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);

            if (erroNome) {
              setErroNome("");
            }
          }}
          className={`${inputClassBase} ${erroNome ? inputError : ""}`}
        />

        {erroNome && (
          <p className="mt-2 text-base text-rose-800">
            ⚠️ {erroNome}
          </p>
        )}
      </div>

      {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
      <div className="mb-3">
        <label className="text-sm font-medium text-zinc-700">
          Imagem
        </label>

        {permitirUploadImagem ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg bg-blue-800 px-4 py-2 font-semibold text-white transition hover:bg-blue-900">
              Escolher foto

              <input
                type="file"
                accept="image/*"
                onChange={handleSelecionarImagem}
                className="hidden"
              />
            </label>

            {imagem && (
              <button
                type="button"
                onClick={() => setImagem("")}
                className="rounded-lg bg-zinc-700 px-4 py-2 font-semibold text-white transition hover:bg-zinc-800"
              >
                Remover foto
              </button>
            )}
          </div>
        ) : (
          <input
            placeholder="URL da imagem"
            value={imagem}
            onChange={(e) => {
              setImagem(limparTexto(e.target.value));
            }}
            className={inputClassBase}
          />
        )}
      </div>
      {/* ===== FIM DA ALTERAÇÃO ===== */}

     {(imagem.startsWith("http://") ||
        imagem.startsWith("https://") ||
        imagem.startsWith("/images/") ||
        imagem.startsWith("data:image/")) && (

  <div className="mt-2">
    <img
      key={imagem}
      src={imagem}
      alt="Preview da receita"
      className="h-40 w-full rounded border object-cover opacity-0 transition-opacity duration-500"
      onLoad={(e) => {
        e.currentTarget.style.display = "block";
        e.currentTarget.style.opacity = "1";
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
)}
 </>
  );
}