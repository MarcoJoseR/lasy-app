// fallback-img.tsx
import Image from "next/image";
import { useState } from "react";

export default function FallbackImage({ src, alt, ...props }) {
  const fallback = "/images/receitas/sem-imagem.jpg";
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    // se quiser otimização, use <Image>. Porém, onError de <Image> pode ser inconsistente.
    // Aqui mostramos um <img> simples para garantir fallback confiável:
    <img
      src={imgSrc}
      alt={alt}
      {...props}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );
}
