"use client";

import { useTimer } from "@/app/context/TimerContext";

export default function AvisoTimer() {
  const { timers, pararAlarme } = useTimer();

  const timersComAviso = timers.filter(
    (timer) => timer.avisoVisivel
  );

  if (timersComAviso.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center shadow-2xl">
        <div className="space-y-5">
          {timersComAviso.map((timer) => {
            const minutos = Math.floor(timer.tempoRestante / 60);
            const segundos = timer.tempoRestante % 60;

            const tempoFormatado = `${String(minutos).padStart(
              2,
              "0"
            )}:${String(segundos).padStart(2, "0")}`;

            return (
              <div
                key={timer.id}
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-4"
              >
                {!timer.alarmeAtivo ? (
                  <>
                    <p className="text-xl font-bold text-yellow-300">
                      ⏱️ {timer.nome || `Timer ${timer.id}`}
                    </p>

                    <p className="mt-4 text-5xl font-bold text-white">
                      {tempoFormatado}
                    </p>

                    <p className="mt-3 text-lg text-zinc-300">
                      O tempo está terminando...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-yellow-300">
                      🔔 {timer.nome || `Timer ${timer.id}`}
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                      Tempo encerrado!
                    </p>

                    <button
                      type="button"
                      onClick={() => pararAlarme(timer.id)}
                      className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 text-lg font-bold text-white transition hover:bg-red-500"
                    >
                      Parar alarme
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}