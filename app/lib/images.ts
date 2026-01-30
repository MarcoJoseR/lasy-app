// app/lib/images.ts

export function fixImagePath(
  categoria?: string,
  subcategoria?: string,
  imagemRef?: string
): string {
  // se faltar qualquer informação, retorna placeholder
  if (!categoria || !subcategoria) {
    return "/images/placeholder.jpg";
  }

  // imagem específica da receita
  if (imagemRef && imagemRef.trim() !== "") {
    return `/images/receitas/${categoria}/${subcategoria}/${imagemRef}`;
  }

  // fallback: primeira imagem da subcategoria
  return `/images/receitas/${categoria}/${subcategoria}/1.jpg`;
}
