import { fixImagePath } from "@/app/lib/images";

export function getReceitaImage(
  categoria?: string | null,
  subcategoria?: string | null,
  imagem?: string | null
): string {
  // fallback absoluto
  if (!categoria || !subcategoria) {
    return "/images/receitas/sem-imagem.jpg";
  }

  // imagem definida na receita
  if (imagem && imagem.trim() !== "") {
    return fixImagePath(categoria, subcategoria, imagem);
  }

  // fallback natural da subcategoria
  return fixImagePath(categoria, subcategoria);
}
