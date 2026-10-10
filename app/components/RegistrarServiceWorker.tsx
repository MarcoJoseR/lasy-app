"use client";

import { useEffect } from "react";

export default function RegistrarServiceWorker() {
  useEffect(() => {
  if (process.env.NODE_ENV === "development") return;

  if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error(
            "Erro ao registrar Service Worker:",
            error
          );
        });
    }
  }, []);

  return null;
}