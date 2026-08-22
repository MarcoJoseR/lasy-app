"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface TimerItem {
  id: 1 | 2;
  nome: string;
  tempoRestante: number;
  rodando: boolean;
  alarmeAtivo: boolean;
  avisoVisivel: boolean;
}

interface TimerContextType {
  timers: TimerItem[];
  receitaTimerId: string | null;
  definirReceitaTimer: (receitaId: string) => void;
  iniciarTimer: (id: 1 | 2, segundos: number) => void;
  pausarTimer: (id: 1 | 2) => void;
  continuarTimer: (id: 1 | 2) => void;
  cancelarTimer: (id: 1 | 2) => void;
  pararAlarme: (id: 1 | 2) => void;
  atualizarNomeTimer: (id: 1 | 2, nome: string) => void;
  adicionarTimer: () => void;
  timerRestaurado: boolean;
}

const TimerContext = createContext<TimerContextType | null>(null);
const TIMER_STORAGE_KEY = "healthTimerGlobalV1";

export function TimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timers, setTimers] = useState<TimerItem[]>([
    {
      id: 1,
      nome: "",
      tempoRestante: 0,
      rodando: false,
      alarmeAtivo: false,
      avisoVisivel: false,
    },
  ]);

  const [receitaTimerId, setReceitaTimerId] = useState<string | null>(null);
  const [timerRestaurado, setTimerRestaurado] = useState(false);

  const fimTimerRef = useRef<Record<number, number | null>>({
    1: null,
    2: null,
  });

  const audioRef = useRef<Record<1 | 2, HTMLAudioElement | null>>({
  1: null,
  2: null,
});

  const intervaloAlarmeRef = useRef<
    Record<number, ReturnType<typeof setInterval> | null>
  >({
    1: null,
    2: null,
  });

// Restaura o Timer depois de uma recarga da PWA.
useEffect(() => {
  try {
    const salvo = sessionStorage.getItem(TIMER_STORAGE_KEY);

    if (!salvo) {
      setTimerRestaurado(true);
      return;
    }

    const estado = JSON.parse(salvo);

    if (Array.isArray(estado.timers)) {
      setTimers(estado.timers);
    }

    if (
      typeof estado.receitaTimerId === "string" ||
      estado.receitaTimerId === null
    ) {
      setReceitaTimerId(estado.receitaTimerId);
    }

    if (estado.fins) {
      fimTimerRef.current = {
        1: estado.fins[1] ?? null,
        2: estado.fins[2] ?? null,
      };
    }
  } catch (error) {
    console.error("Erro ao restaurar Timer:", error);
  } finally {
    setTimerRestaurado(true);
  }
}, []);

// Mantém o estado do Timer salvo durante a navegação.
useEffect(() => {
  if (!timerRestaurado) return;

  sessionStorage.setItem(
    TIMER_STORAGE_KEY,
    JSON.stringify({
      timers,
      receitaTimerId,
      fins: fimTimerRef.current,
    })
  );
}, [timers, receitaTimerId, timerRestaurado]);

  async function prepararAudio(id: 1 | 2) {
  try {
    if (!audioRef.current[id]) {
      const audio = new Audio("/sounds/alarme-timer.wav");

      audio.preload = "auto";
      audio.volume = 1;

      audioRef.current[id] = audio;
    }

    const audio = audioRef.current[id];

    if (!audio) return;

    // O clique em "Iniciar" autoriza o áudio no celular/PWA.
    audio.volume = 0;

    await audio.play();

    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
  } catch (error) {
    console.error("Não foi possível preparar o áudio:", error);
  }
}

function tocarBip(id: 1 | 2) {
  const audio = audioRef.current[id];

  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;

    void audio.play().catch((error) => {
      console.error("Não foi possível tocar o alarme:", error);
    });
  } catch (error) {
    console.error("Erro ao tocar o alarme:", error);
  }
}

 function atualizarTimer(
  id: 1 | 2,
  dados: Partial<TimerItem>
) {
  setTimers((anteriores) => {
    const atualizados = anteriores.map((timer) =>
      timer.id === id ? { ...timer, ...dados } : timer
    );

    // Persiste imediatamente o estado global do Timer.
    sessionStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({
        timers: atualizados,
        receitaTimerId,
        fins: fimTimerRef.current,
      })
    );

    return atualizados;
  });
}

  function iniciarAlarme(id: 1 | 2) {
    if (intervaloAlarmeRef.current[id]) return;

    atualizarTimer(id, {
      alarmeAtivo: true,
      avisoVisivel: true,
    });

    tocarBip(id);

    intervaloAlarmeRef.current[id] = setInterval(() => {
      tocarBip(id);
    }, 2000);
  }

  function pararAlarme(id: 1 | 2) {
    const intervalo = intervaloAlarmeRef.current[id];

    if (intervalo) {
      clearInterval(intervalo);
      intervaloAlarmeRef.current[id] = null;
    }

    atualizarTimer(id, {
      alarmeAtivo: false,
      avisoVisivel: false,
      tempoRestante: 0,
    });
  }

  async function iniciarTimer(id: 1 | 2, segundos: number) {
  await prepararAudio(id);

  pararAlarme(id);

  if (segundos <= 0) return;

  fimTimerRef.current[id] = Date.now() + segundos * 1000;

  atualizarTimer(id, {
    tempoRestante: segundos,
    rodando: true,
    avisoVisivel: false,
  });
}

  function pausarTimer(id: 1 | 2) {
    const timer = timers.find((item) => item.id === id);

    if (!timer?.rodando) return;

    const fim = fimTimerRef.current[id];

    if (fim) {
      const restante = Math.max(
        0,
        Math.ceil((fim - Date.now()) / 1000)
      );

      atualizarTimer(id, {
        tempoRestante: restante,
      });
    }

    fimTimerRef.current[id] = null;

    atualizarTimer(id, {
      rodando: false,
    });
  }

  function continuarTimer(id: 1 | 2) {
    const timer = timers.find((item) => item.id === id);

    if (!timer || timer.tempoRestante <= 0) return;

    void prepararAudio(id);

    fimTimerRef.current[id] =
      Date.now() + timer.tempoRestante * 1000;

    atualizarTimer(id, {
      rodando: true,
    });
  }

  function cancelarTimer(id: 1 | 2) {
    fimTimerRef.current[id] = null;

    atualizarTimer(id, {
      rodando: false,
      tempoRestante: 0,
      avisoVisivel: false,
    });

    pararAlarme(id);
  }

  function atualizarNomeTimer(id: 1 | 2, nome: string) {
    atualizarTimer(id, { nome });
  }

  function adicionarTimer() {
    setTimers((anteriores) => {
      if (anteriores.some((timer) => timer.id === 2)) {
        return anteriores;
      }

      return [
        ...anteriores,
        {
          id: 2,
          nome: "",
          tempoRestante: 0,
          rodando: false,
          alarmeAtivo: false,
          avisoVisivel: false,
        },
      ];
    });
  }

  function definirReceitaTimer(receitaId: string) {
  if (!timerRestaurado) return;

  if (receitaTimerId === receitaId) return;

  Object.values(intervaloAlarmeRef.current).forEach((intervalo) => {
    if (intervalo) {
      clearInterval(intervalo);
    }
  });

  intervaloAlarmeRef.current = {
    1: null,
    2: null,
  };

  fimTimerRef.current = {
    1: null,
    2: null,
  };

  setTimers([
    {
      id: 1,
      nome: "",
      tempoRestante: 0,
      rodando: false,
      alarmeAtivo: false,
      avisoVisivel: false,
    },
  ]);

  setReceitaTimerId(receitaId);
}

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTimers((anteriores) =>
        anteriores.map((timer) => {
          if (!timer.rodando) return timer;

          const fim = fimTimerRef.current[timer.id];

          if (!fim) return timer;

          const restante = Math.max(
            0,
            Math.ceil((fim - Date.now()) / 1000)
          );

          if (restante <= 0) {
            fimTimerRef.current[timer.id] = null;

            iniciarAlarme(timer.id);

            return {
              ...timer,
              tempoRestante: 0,
              rodando: false,
              avisoVisivel: true,
              alarmeAtivo: true,
            };
          }

          return {
            ...timer,
            tempoRestante: restante,
            avisoVisivel:
              timer.avisoVisivel || restante <= 5,
          };
        })
      );
    }, 250);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(intervaloAlarmeRef.current).forEach(
        (intervalo) => {
          if (intervalo) {
            clearInterval(intervalo);
          }
        }
      );

      Object.values(audioRef.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timers,
        receitaTimerId,
        timerRestaurado,
        definirReceitaTimer,
        iniciarTimer,
        pausarTimer,
        continuarTimer,
        cancelarTimer,
        pararAlarme,
        atualizarNomeTimer,
        adicionarTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);

  if (!context) {
    throw new Error(
      "useTimer deve ser usado dentro de TimerProvider"
    );
  }

  return context;
}