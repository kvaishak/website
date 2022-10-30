import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import Menu from "../components/Menu/menu";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" value={{ dark: "dark-theme" }}>
      <Menu />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
