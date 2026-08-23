import type { Viewport } from "next";

import { ReceitasProvider } from "./context/ReceitasContext";
import { ListasComprasProvider } from "./context/ListasComprasContext";
import Navbar from "./components/Navbar";
import "./globals.css";
import { TimerProvider } from "./context/TimerContext";
import AvisoTimer from "./components/AvisoTimer";
import RegistrarServiceWorker from "./components/RegistrarServiceWorker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-black text-white">
        <RegistrarServiceWorker />

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