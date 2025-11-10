// C:\supabase-app\src\components\Layout.tsx
import React, { ReactNode } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f9f9f9", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "#ff6b6b", padding: "15px", color: "#fff", textAlign: "center" }}>
        <h1>Projeto Lasy - Receitas</h1>
        <nav>
          <Link href="/" style={{ color: "#fff", margin: "0 10px" }}>Home</Link>
          <Link href="/categoria/doces" style={{ color: "#fff", margin: "0 10px" }}>Doces</Link>
          <Link href="/categoria/massas" style={{ color: "#fff", margin: "0 10px" }}>Massas</Link>
        </nav>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: "20px" }}>{children}</main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "15px", background: "#eee", marginTop: "40px" }}>
        © 2025 Projeto Lasy
      </footer>
    </div>
  );
}
