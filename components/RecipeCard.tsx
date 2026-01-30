"use client";

import Image from "next/image";
import Link from "next/link";

function sanitizeImagePath(path?: string | null): string {
  if (!path || path.trim() === "") return "/logo.png";

  let p = path.replace(/\\/g, "/"); // remove '\' do Windows
  p = p.replace(/^\/+/, "");        // remove barras duplicadas no início
  return "/" + p;                   // garante caminho absoluto
}

interface RecipeCardProps {
  recipe: {
    id: number;
    slug?: string | null;
    titulo: string;
    image_url?: string | null;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const imagePath = sanitizeImagePath(recipe.image_url);

  const slugPath = recipe.slug
    ? `/receita/${recipe.slug}`
    : `/receita/${recipe.id}`;

  return (
    <Link href={slugPath}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
        <div className="relative w-full h-48">
          <Image
            src={imagePath}
            alt={recipe.titulo}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold">{recipe.titulo}</h2>
        </div>
      </div>
    </Link>
  );
}
