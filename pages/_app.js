import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import Menu from "../components/Menu/menu";
import Footer from "../components/Footer/footer";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" value={{ dark: "dark-theme" }}>
      <Menu />
      <Component {...pageProps} />
      {/* <Footer /> */}
    </ThemeProvider>
  );
}

export default MyApp;
