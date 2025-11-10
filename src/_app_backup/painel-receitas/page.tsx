"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EditarReceitaModal from "@/components/EditarReceitaModal";
import ExcluirReceitaButton from "@/components/ExcluirReceitaButton";

interface Receita {
  id: number;
  nome: string;
  ingredientes: string[];
  modo_preparo: string;
}

export default function PainelReceitasPage() {
  const supabase = createClientComponentClient();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroIngrediente, setFiltroIngrediente] = useState("");

  const fetchReceitas = async () => {
    const { data, error } = await supabase.from("receitas").select("*");
    if (error) {
      toast.error("Erro ao buscar receitas");
      console.error(error);
    } else {
      setReceitas(data);
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, []);

  const receitasFiltradas = receitas.filter(r =>
    r.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroIngrediente === "" || r.ingredientes.join(" ").toLowerCase().includes(filtroIngrediente.toLowerCase()))
  );

  return (
    <div className="p-8">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Painel de Receitas</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Filtrar por ingrediente..."
          value={filtroIngrediente}
          onChange={e => setFiltroIngrediente(e.target.value)}
          className="border p-2 rounded flex-1"
        />
      </div>

      <div className="space-y-4">
        {receitasFiltradas.length === 0 && <p>Nenhuma receita encontrada.</p>}

        {receitasFiltradas.map(r => (
          <div key={r.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{r.nome}</h2>
            <p>
              <strong>Ingredientes:</strong> {Array.isArray(r.ingredientes) ? r.ingredientes.join(", ") : r.ingredientes}
            </p>
            <p>
              <strong>Modo de preparo:</strong> {r.modo_preparo}
            </p>
            <div className="flex gap-2 mt-2">
              <EditarReceitaModal receita={r} onSave={fetchReceitas} />
              <ExcluirReceitaButton id={r.id} nome={r.nome} onDelete={fetchReceitas} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
