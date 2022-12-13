import "../styles/globals.css";
import "../styles/notion.css";

import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Menu from "../components/Menu/menu";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" value={{ dark: "dark-theme" }}>
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
      <Script src="https://app.embed.im/snow.js"></Script>
    </ThemeProvider>
  );
}

export default MyApp;
