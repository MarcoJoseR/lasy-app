import Head from "next/head";
import type { AppProps } from "next/app";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Projeto Lasy – Receitas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="Projeto Lasy – Receitas, receitas caseiras organizadas por categoria e subcategoria"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
