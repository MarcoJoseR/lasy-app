// src/app/layout.tsx
import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Lasy App - Receitas Inteligentes',
  description: 'Aplicativo de receitas conectado ao Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        backgroundColor: '#f7f7f7',
        color: '#333',
        fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
      }}>
        <header style={{
          backgroundColor: '#0070f3',
          color: '#fff',
          padding: '15px 25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>🍳 Projeto Lasy</h1>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Início</Link>
            <Link href="/receitas" style={{ color: '#fff', textDecoration: 'none' }}>Receitas</Link>
            <Link href="/sobre" style={{ color: '#fff', textDecoration: 'none' }}>Sobre</Link>
          </nav>
        </header>

        <main style={{ padding: '30px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
