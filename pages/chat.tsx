"use client";

import { useEffect, useState } from "react";

export default function Chat() {
  const [mensagem, setMensagem] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    async function buscarResposta() {
      setCarregando(true);
      try {
        const res = await fetch("/api/openai");
        const data = await res.json();
        if (data.ok) {
          setMensagem(data.resposta);
        } else {
          setMensagem("Erro: " + data.erro);
        }
      } catch (err) {
        setMensagem("Erro ao conectar com a API.");
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    buscarResposta();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Chat OpenAI</h1>
      {carregando ? <p>Carregando resposta...</p> : <p>{mensagem}</p>}
    </div>
  );
}
