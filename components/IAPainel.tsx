// components/IAPainel.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function IAPainel({ receita }) {
  const [descricao, setDescricao] = useState(receita.descricao_ia || "");
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function gerarDescricao() {
    setLoading(true);
    try {
      // 🔹 Gera texto via API local
      const res = await fetch("/api/gerarDescricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: receita.nome,
          categoria: receita.categoria,
          ingredientes: receita.ingredientes || "não informados",
        }),
      });

      const data = await res.json();
      const textoGerado = data.descricao || "Não foi possível gerar descrição.";
      setDescricao(textoGerado);

      // 🔹 Salva automaticamente no Supabase
      setSalvando(true);
      const { error } = await supabase
        .from("receitas")
        .update({ descricao_ia: textoGerado })
        .eq("id", receita.id);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        alert("Erro ao salvar descrição gerada!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar descrição via IA.");
    } finally {
      setLoading(false);
      setSalvando(false);
    }
  }

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white mt-4 transition-all hover:shadow-md">
      <h3 className="text-lg font-semibold mb-2">{receita.nome}</h3>

      <button
        onClick={gerarDescricao}
        disabled={loading}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
      >
        {loading ? "Gerando descrição..." : "✨ Gerar Descrição Automática"}
      </button>

      {descricao && (
        <div className="mt-3">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="w-full border p-2 rounded text-sm bg-gray-50"
          />
          {salvando ? (
            <p className="text-green-600 text-sm mt-1">💾 Salvando no banco...</p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">
              Descrição sincronizada automaticamente.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
