import "../styles/globals.css";
// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css";
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
