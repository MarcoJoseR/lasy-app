"use client";

import ImportarLasyModal from "@/components/ImportarLasyModal";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">
        🍳 Lasy Receitas - Painel de Importação
      </h1>

      <section className="flex justify-center">
        <ImportarLasyModal />
      </section>

      <p className="text-center mt-6 text-gray-600 text-sm">
        Envie um arquivo <code>.json</code> com suas receitas para importar no Supabase.
      </p>
    </main>
  );
}
