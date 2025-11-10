"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ExcluirReceitaButtonProps {
  id: number;
  nome: string;
  onDelete: () => void;
}

export default function ExcluirReceitaButton({ id, nome, onDelete }: ExcluirReceitaButtonProps) {
  const supabase = createClientComponentClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("receitas").delete().eq("id", id);
    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Erro ao excluir a receita.");
    } else {
      toast.success(`Receita "${nome}" excluída com sucesso!`);
      setOpen(false);
      onDelete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">🗑️ Excluir</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Receita</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          Tem certeza de que deseja excluir <strong>{nome}</strong>?  
          Essa ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? "Excluindo..." : "Confirmar Exclusão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
