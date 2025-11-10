// supabase/functions/openai_test/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    return new Response(
      JSON.stringify({ ok: false, message: "❌ OPENAI_API_KEY não encontrada." }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  console.log("✅ OPENAI_API_KEY detectada com sucesso!");
  console.log(openaiKey.slice(0, 10) + "..."); // mostra só o início por segurança

  return new Response(
    JSON.stringify({ ok: true, message: "✅ OPENAI_API_KEY detectada e ativa." }),
    { headers: { "Content-Type": "application/json" } }
  );
});
