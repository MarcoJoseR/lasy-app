// components/Layout.tsx
import { ReactNode } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-green-600 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <span className="font-bold text-xl cursor-pointer">Meu App de Receitas</span>
          </Link>
          <div>
            <Link href="/">
              <span className="mr-4 hover:underline cursor-pointer">Home</span>
            </Link>
            <Link href="/sobre">
              <span className="hover:underline cursor-pointer">Sobre</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} Meu App de Receitas. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
