"use client";

import Link from "next/link";

export default function ReceitaIndexPage() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Página Receitas</h1>
      <p>
        Esta é a página principal dentro da pasta <code>/receita</code>.
      </p>
      <p>
        Para ver todas as receitas, acesse a <Link href="/">lista completa de receitas</Link>.
      </p>
      <p>
        Para ver detalhes de uma receita específica, use a URL com o slug:{" "}
        <code>/receita/[slug]</code>.
      </p>
    </main>
  );
}

