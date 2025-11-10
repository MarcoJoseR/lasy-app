"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-orange-500 text-white p-4 shadow-md">
      <Link href="/" className="text-xl font-bold hover:text-yellow-200">
        Meu App de Receitas
      </Link>

      <nav className="flex gap-4">
        <Link href="/" className="hover:text-yellow-200">Home</Link>
        <Link href="/sobre" className="hover:text-yellow-200">Sobre</Link>
      </nav>
    </header>
  );
}
