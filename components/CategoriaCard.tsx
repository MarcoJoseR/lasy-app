import React from "react";

interface CategoriaCardProps {
  nome: string;
  imagem?: string;
  onClick?: () => void;
}

export default function CategoriaCard({ nome, imagem, onClick }: CategoriaCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center justify-center text-center"
    >
      {imagem && (
        <img
          src={imagem}
          alt={nome}
          className="w-24 h-24 object-cover rounded-full mb-2"
        />
      )}
      <h3 className="text-lg font-semibold text-gray-800">{nome}</h3>
    </div>
  );
}
