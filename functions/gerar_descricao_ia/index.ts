// supabase/functions/gerar_descricao_ia/index.ts

import OpenAI from "openai";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

serve(async (req) => {
  try {
    const { id, nome } = await req.json();

    if (!id || !nome) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400 });
    }

    const prompt = `Crie uma descrição curta, atrativa e natural para a categoria de receitas "${nome}".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const descricao = completion.choices[0]?.message?.content?.trim() || "";

    if (descricao) {
      await supabase
        .from("categorias")
        .update({ descricao_ia: descricao })
        .eq("id", id);
    }

    return new Response(
      JSON.stringify({ descricao }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na função gerar_descricao_ia:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
