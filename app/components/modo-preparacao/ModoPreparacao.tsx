"use client";

import { useEffect, useRef, useState } from "react";
import { useTimer } from "@/app/context/TimerContext";
import { useReceitas } from "@/app/context/ReceitasContext";

interface ReceitaPreparacao {
  id: string;
  nome: string
  ingredientes: string[];
  modoPreparo: string[];
}

interface ModoPreparacaoProps {
  receita: ReceitaPreparacao;
  onSair: () => void;
}

export default function ModoPreparacao({
  receita,
  onSair,
}: ModoPreparacaoProps) {
  
  const [temposDigitados, setTemposDigitados] = useState<
  Record<1 | 2, { minutos: string; segundos: string }>
>({
  1: {
    minutos: "5",
    segundos: "0",
  },
  2: {
    minutos: "5",
    segundos: "0",
  },
});
    
  const [receitaRealizada, setReceitaRealizada] = useState(false);

useEffect(() => {
  try {
    const dados = localStorage.getItem("preparacaoPendente");

    if (!dados) return;

    const preparacao = JSON.parse(dados);

    if (
      String(preparacao.receitaId) === String(receita.id) &&
      preparacao.realizadaEm
    ) {
      setReceitaRealizada(true);
    }
  } catch (error) {
    console.error("Erro ao verificar preparação:", error);
  }
}, [receita.id]);

  const {
  timers,
  timerRestaurado,
  definirReceitaTimer,
  iniciarTimer,
  pausarTimer,
  continuarTimer,
  cancelarTimer,
  pararAlarme,
  atualizarNomeTimer,
  adicionarTimer,
} = useTimer();

useEffect(() => {
  if (!timerRestaurado) return;

  definirReceitaTimer(String(receita.id));
}, [receita.id, timerRestaurado]);

  const {
  receitas,
  adicionarNaBiblioteca,
  registrarPreparacao,
} = useReceitas();

  function iniciar(id: 1 | 2) {
  const dados = temposDigitados[id];

  const totalSegundos =
    Math.max(0, Number(dados.minutos) || 0) * 60 +
    Math.max(0, Number(dados.segundos) || 0);

  iniciarTimer(id, totalSegundos);
}

function atualizarTempoDigitado(
  id: 1 | 2,
  campo: "minutos" | "segundos",
  valor: string
) {
  setTemposDigitados((anterior) => ({
    ...anterior,
    [id]: {
      ...anterior[id],
      [campo]: valor,
    },
  }));
}

function formatarTempo(tempoRestante: number) {
  const minutosExibidos = Math.floor(tempoRestante / 60);
  const segundosExibidos = tempoRestante % 60;

  return `${String(minutosExibidos).padStart(2, "0")}:${String(
    segundosExibidos
  ).padStart(2, "0")}`;
}

function marcarReceitaRealizada() {
  if (receitaRealizada) return;

  let receitaIdParaRegistrar = String(receita.id);

  // Localiza a receita completa no contexto.
  const receitaCompleta = receitas.find(
    (r) => String(r.id) === String(receita.id)
  );

  // Se ainda pertence à Coleção Inicial,
  // só agora passa para a Minha Biblioteca.
  if (receitaCompleta?.colecaoInicial === true) {
    const receitaExistente = receitas.find(
      (r) =>
        r.tipo === "pessoal" &&
        r.colecaoInicial !== true &&
        r.nome.trim().toLowerCase() ===
          receitaCompleta.nome.trim().toLowerCase()
    );

    if (receitaExistente) {
      receitaIdParaRegistrar = String(receitaExistente.id);
    } else {
      const novaReceita =
        adicionarNaBiblioteca(receitaCompleta);

      receitaIdParaRegistrar = String(novaReceita.id);
    }
  }

  registrarPreparacao(receitaIdParaRegistrar);

  const realizadaEm = new Date().toISOString();

  try {
    const dados =
      localStorage.getItem("preparacaoPendente");

    if (dados) {
      const preparacao = JSON.parse(dados);

      localStorage.setItem(
        "preparacaoPendente",
        JSON.stringify({
          ...preparacao,
          receitaId: receitaIdParaRegistrar,
          realizadaEm,
        })
      );
    }
  } catch (error) {
    console.error(
      "Erro ao registrar preparação realizada:",
      error
    );
  }

  setReceitaRealizada(true);
}

const wakeLockRef = useRef<WakeLockSentinel | null>(null);

useEffect(() => {
  let ativo = true;

  const manterTelaAcordada = async () => {
    if (!ativo) return;

    if (!("wakeLock" in navigator)) {
      console.log("Wake Lock não suportado neste dispositivo.");
      return;
    }

    if (document.visibilityState !== "visible") {
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");

      console.log("Tela mantida ativa no Modo de Preparação.");

      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch (erro) {
      console.log("Não foi possível manter a tela ativa:", erro);
    }
  };

  const aoVoltarParaPagina = () => {
    if (
      document.visibilityState === "visible" &&
      !wakeLockRef.current
    ) {
      manterTelaAcordada();
    }
  };

  manterTelaAcordada();

  document.addEventListener(
    "visibilitychange",
    aoVoltarParaPagina
  );

  return () => {
    ativo = false;

    document.removeEventListener(
      "visibilitychange",
      aoVoltarParaPagina
    );

    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };
}, []);

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="sticky top-0 z-20 mb-8 rounded-xl bg-green-800 p-5 shadow-lg">
          <button
            type="button"
            onClick={onSair}
            className="mb-3 rounded-lg bg-green-700 px-4 py-2 text-base font-semibold text-white transition hover:bg-green-600"
          >
            ← Sair
          </button>

          <h1 className="text-3xl font-bold">{receita.nome}</h1>

          <p className="mt-2 text-lg font-semibold text-green-100">
            🍳 Modo de Preparo
          </p>

          <button
            type="button"
            onClick={marcarReceitaRealizada}
            disabled={receitaRealizada}
            className={`mt-4 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              receitaRealizada
                ? "cursor-default border-green-300 bg-green-700 text-white"
                : "border-zinc-300 text-green-100 hover:bg-green-700"
            }`}
            title={
              receitaRealizada
                ? "Receita registrada como realizada"
                : "Marcar esta receita como realizada"
            }
          >
            {receitaRealizada ? "✓ Receita realizada" : "Marcar como realizada"}
          </button>

          </header>

          <div className="sticky top-0 z-20 mb-8 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-lg">
            <div className="space-y-4">
              {timers.map((timer) => {
                const dadosDigitados = temposDigitados[timer.id];
                const tempoFormatado = formatarTempo(timer.tempoRestante);

                return (
                  <div
                    key={timer.id}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 p-3"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="font-bold">
                        ⏱️ Timer {timer.id}
                      </span>

                      <input
                        type="text"
                        value={timer.nome}
                        onChange={(event) =>
                          atualizarNomeTimer(timer.id, event.target.value)
                        }
                        placeholder="Ex.: Feijão, Assado..."
                        className="min-w-40 flex-1 rounded bg-white px-3 py-1 text-black"
                        aria-label={`Identificação do Timer ${timer.id}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!timer.rodando &&
                        timer.tempoRestante === 0 &&
                        !timer.alarmeAtivo && (
                          <>
                            <input
                              type="number"
                              min="0"
                              value={dadosDigitados.minutos}
                              onChange={(event) =>
                                atualizarTempoDigitado(
                                  timer.id,
                                  "minutos",
                                  event.target.value
                                )
                              }
                              className="w-20 rounded bg-white px-2 py-1 text-center text-black"
                              aria-label={`Minutos do Timer ${timer.id}`}
                            />

                            <span>min</span>

                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={dadosDigitados.segundos}
                              onChange={(event) =>
                                atualizarTempoDigitado(
                                  timer.id,
                                  "segundos",
                                  event.target.value
                                )
                              }
                              className="w-16 rounded bg-white px-2 py-1 text-center text-black"
                              aria-label={`Segundos do Timer ${timer.id}`}
                            />

                            <span>seg</span>

                            <button
                              type="button"
                              onClick={() => iniciar(timer.id)}
                              className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black"
                            >
                              Iniciar
                            </button>
                          </>
                        )}

                      {(timer.rodando || timer.tempoRestante > 0) &&
                        !timer.alarmeAtivo && (
                          <>
                            <span className="min-w-24 text-center text-3xl font-bold">
                              {tempoFormatado}
                            </span>

                            {timer.rodando ? (
                              <button
                                type="button"
                                onClick={() => pausarTimer(timer.id)}
                                className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black"
                              >
                                Pausar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => continuarTimer(timer.id)}
                                className="rounded-lg bg-green-500 px-4 py-2 font-bold text-black"
                              >
                                Continuar
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => cancelarTimer(timer.id)}
                              className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                      {timer.alarmeAtivo && (
                        <>
                          <span className="text-xl font-bold text-yellow-300">
                            🔔 {timer.nome || `Timer ${timer.id}`} — Tempo encerrado!
                          </span>

                          <button
                            type="button"
                            onClick={() => pararAlarme(timer.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white"
                          >
                            Parar alarme
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {timers.length < 2 && (
                <button
                  type="button"
                  onClick={adicionarTimer}
                  className="rounded-lg border border-zinc-600 px-4 py-2 font-bold text-white"
                >
                  + Novo Timer
                </button>
              )}
            </div>
          </div>
       
        <section className="mb-10">
          <h2 className="mb-5 text-2xl font-bold text-yellow-400">
            Ingredientes
          </h2>

          {receita.ingredientes.length > 0 ? (
            <ul className="space-y-4">
              {receita.ingredientes.map((ingrediente, index) => (
                <li
                  key={`${ingrediente}-${index}`}
                  className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-xl leading-relaxed"
                >
                  {ingrediente}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-lg text-gray-300">
              Esta receita ainda não possui ingredientes registrados.
            </p>
          )}
        </section>

        <section className="mb-10">
          <h2 className="mb-5 text-2xl font-bold text-orange-400">
            Modo de Preparo
          </h2>

          {receita.modoPreparo.length > 0 ? (
            <ol className="space-y-5">
              {receita.modoPreparo.map((etapa, index) => (
                <li
                  key={`${etapa}-${index}`}
                  className="rounded-lg border border-gray-700 bg-gray-900 p-5 text-xl leading-relaxed"
                >
                  <span className="mb-2 block font-bold text-orange-300">
                    Etapa {index + 1}
                  </span>

                  {etapa}
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-lg text-gray-300">
              Esta receita ainda não possui o modo de preparo registrado.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}