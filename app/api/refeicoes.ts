// pages/api/refeicoes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient"; // Ajuste o caminho conforme seu projeto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    // Aqui você pode filtrar pelo usuário, se tiver autenticação
    const { data, error } = await supabase
      .from("refeicoes")
      .select("*")
      .order("hora", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Erro ao buscar refeições:", error);
    return res.status(500).json({ message: error.message || "Erro interno" });
  }
}
