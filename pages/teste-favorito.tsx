import { useState } from "react";

export default function TesteFavorito() {
  const [favorito, setFavorito] = useState(false);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Teste Favorito</h1>
      <button
        onClick={() => setFavorito(!favorito)}
        className={`px-4 py-2 rounded ${
          favorito ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {favorito ? "Favorito" : "Favoritar"}
      </button>
    </div>
  );
}
