"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import CardReceita from "@/src/components/CardReceita";

interface Receita {
  id: number;
  nome: string;
  categoria?: string;
  imagem?: string;
}

interface Props {
  initialReceitas: Receita[];
}

export default function ReceitasClient({ initialReceitas }: Props) {
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<Receita[]>(initialReceitas);

  const filtradas = useMemo(() => {
    if (!busca) return lista;
    return lista.filter((r) =>
      r.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, lista]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <input
        className="border p-2 mb-4 w-full"
        placeholder="Buscar receita..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtradas.map((r) => (
          <CardReceita key={r.id} receita={r} />
        ))}
      </div>
    </div>
  );
}
