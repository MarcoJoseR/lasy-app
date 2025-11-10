"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ImportarLasyModal() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  // Função para ler o arquivo JSON
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!Array.isArray(json)) {
          toast.error("Arquivo JSON inválido!");
          return;
        }
        setPreview(json);
        console.log("Debug: Receitas detectadas", json);
      } catch (err) {
        toast.error("Erro ao ler o JSON!");
        console.error(err);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Função para importar receitas no Supabase
  const handleImport = async () => {
    if (preview.length === 0) {
      toast.error("Nenhuma receita para importar!");
      return;
    }

    try {
      const novasReceitas = preview.map((r) => ({
        nome: r.nome,
        modo_preparo: r.modo_preparo,
        // Corrige ingredientes: array → string separada por vírgula
        ingredientes: Array.isArray(r.ingredientes) ? r.ingredientes.join(", ") : r.ingredientes,
      }));

      const { data, error } = await supabase.from("receitas").insert(novasReceitas);
      if (error) throw error;

      toast.success(`Importação concluída! ${data?.length || 0} receitas adicionadas.`);
      setPreview([]);
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao importar receitas!");
    }
  };

  return (
    <div>
      <h2>Importar Receitas Lasy</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      {preview.length > 0 && (
        <div>
          <h3>Receitas detectadas ({preview.length}):</h3>
          <ul>
            {preview.map((r, idx) => (
              <li key={idx}>{r.nome}</li>
            ))}
          </ul>
        </div>
      )}
      <Button onClick={handleImport} disabled={preview.length === 0}>
        Iniciar Importação
      </Button>
      <Toaster position="top-right" />
    </div>
  );
}
