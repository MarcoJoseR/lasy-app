import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 text-center font-bold text-xl">Receitas do Chef</header>
      <main className="p-4">{children}</main>
      <footer className="bg-white shadow p-4 text-center text-gray-500">© 2025 Marco - Projeto Lasy</footer>
    </div>
  );
}
