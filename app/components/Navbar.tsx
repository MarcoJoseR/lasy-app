"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-zinc-900 text-white px-6 py-4 flex justify-between items-center shadow-md">

      <Link href="/recepcao">
        <h1 className="text-xl font-bold cursor-pointer">
          🍳 Health Receitas
        </h1>
      </Link>

      <div className="flex gap-3">
        <Link href="/recepcao">
          <button
            className={
              "px-3 py-2 rounded border transition " +
              (pathname === "/recepcao"
                ? "border-white bg-green-900 text-white"
                : "border-transparent bg-green-700 text-white hover:bg-green-800")
            }
          >
            🍳 Home
          </button>
        </Link>

        <Link href="/">
          <button
            className={
              "px-3 py-2 rounded border transition " +
              (pathname === "/"
                ? "border-white bg-green-900 text-white"
                : "border-transparent bg-green-700 text-white hover:bg-green-800")
            }
          >
            🔎 Pesquisar Receitas
          </button>
        </Link>

        <Link href="/favoritos">
          <button
            className={
              "px-3 py-2 rounded border transition " +
              (pathname === "/favoritos"
                ? "border-white bg-green-900 text-white"
                : "border-transparent bg-green-800 text-white hover:bg-green-700")
            }
          >
            📚 Minha Biblioteca
          </button>
        </Link>
      </div>

    </nav>
  );
}