import { MeuDiaProvider } from "@/app/context/MeuDiaContext";
import { FavoritosProvider } from "@/app/context/FavoritosContext";
import { ReceitasProvider } from "./context/ReceitasContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
     <FavoritosProvider>
       <ReceitasProvider>
         <MeuDiaProvider>
           {children}
         </MeuDiaProvider>
       </ReceitasProvider>
    </FavoritosProvider>
   
      </body>
    </html>
  );
}
