"use client";

import { useEffect } from "react";
import { ReceitasProvider } from "./context/ReceitasContext";
import { ListasComprasProvider } from "./context/ListasComprasContext";
import Navbar from "./components/Navbar";
import "./globals.css";
import { TimerProvider } from "./context/TimerContext";
import AvisoTimer from "./components/AvisoTimer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => {
        console.error("Erro ao registrar Service Worker:", error);
      });
  }
}, []);

  return (
    <html lang="pt-BR">
      <body className="bg-black text-white min-h-screen">
        <ReceitasProvider>
          <ListasComprasProvider>
            <TimerProvider>
              <Navbar />
              <AvisoTimer />
              {children}
            </TimerProvider>
          </ListasComprasProvider>
        </ReceitasProvider>
      </body>
    </html>
  );
}