import "../styles/globals.css";
import "../styles/notion.css";

import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Menu from "../components/Menu/menu";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" value={{ dark: "dark-theme" }}>
      <Script src="https://literal.club/js/widget.js"></Script>
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
