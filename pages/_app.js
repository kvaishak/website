import "../styles/globals.css";
import "../styles/notion.css";

import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Menu from "../components/Menu/menu";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" value={{ dark: "dark-theme" }}>
      <Head>
        <meta name="description" content="Hello there" />
        <meta name="og:title" content="I am a title" />
        <meta name="og:description" content="I am a description" />
      </Head>
      <Toaster
        toastOptions={{
          duration: 1500,
          style: {
            padding: "3px",
            borderRadius: "6px",
            fontSize: "14px",
          },
        }}
      />
      <Menu />
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}

export default MyApp;
