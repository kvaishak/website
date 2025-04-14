import "../styles/globals.css";
import "../styles/notion.css";

import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Menu from "../components/Menu/menu";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
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
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <Analytics />
    </ThemeProvider>
  );
}

export default MyApp;
