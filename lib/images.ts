// C:\supabase-app\lib\images.ts
export function fixImagePath(categoria: string, imagem: string | null) {
  // Se não houver imagem definida, retorna a imagem padrão
  if (!imagem || imagem.trim() === "") {
    return `/images/receitas/sem-imagem.jpg`;
  }

  // Se a imagem já começa com "/", já está correto
  if (imagem.startsWith("/")) return imagem;

  // Ajuste para a estrutura: public/images/receitas/<categoria>/<imagem>.jpg
  return `/images/receitas/${categoria}/${imagem}.jpg`;
}
