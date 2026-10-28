"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
  const ocultarNavbar =
  pathname === "/inicio" ||
  pathname.startsWith("/bookdigital");

  if (ocultarNavbar) {
    return null;
  }

  return (
    <nav className="bg-zinc-900 text-white px-3 py-4 flex items-center gap-2 shadow-md">

      <Link href="/recepcao">
        <h1 className="text-xl font-bold cursor-pointer">
          🍳 Health
        </h1>
      </Link>

      <div className="flex min-w-0 flex-1 items-stretch gap-2">
        <Link href="/recepcao">
          <button
            className={
              "px-3 py-2 rounded border transition " +
              (pathname === "/recepcao"
                ? "border-white bg-green-900 text-white"
                : "border-transparent bg-green-700 text-white hover:bg-green-800")
            }
          >
            🍳 Home Health
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