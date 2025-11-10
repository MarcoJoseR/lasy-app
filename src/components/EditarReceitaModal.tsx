"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Receita {
  id: number;
  nome: string;
  ingredientes: string[];
  modo_preparo: string;
}

interface EditarReceitaModalProps {
  receita: Receita;
  onSave: () => void;
}

export default function EditarReceitaModal({ receita, onSave }: EditarReceitaModalProps) {
  const supabase = createClientComponentClient();

  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(receita.nome);
  const [ingredientes, setIngredientes] = useState(
  Array.isArray(receita.ingredientes) ? receita.ingredientes.join(", ") : receita.ingredientes || ""
);
  const [modoPreparo, setModoPreparo] = useState(receita.modo_preparo);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const ingredientesArray = ingredientes
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const { error } = await supabase
      .from("receitas")
      .update({
        nome,
        ingredientes: ingredientesArray,
        modo_preparo: modoPreparo,
      })
      .eq("id", receita.id);

    setLoading(false);

    if (error) {
      toast.error("Erro ao atualizar receita.");
      console.error(error);
    } else {
      toast.success("Receita atualizada com sucesso!");
      setOpen(false);
      onSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">✏️ Editar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Receita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ingredientes (separados por vírgula)</label>
            <textarea
              value={ingredientes}
              onChange={(e) => setIngredientes(e.target.value)}
              className="w-full border p-2 rounded h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modo de Preparo</label>
            <textarea
              value={modoPreparo}
              onChange={(e) => setModoPreparo(e.target.value)}
              className="w-full border p-2 rounded h-24"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
