import styles from "./index.module.css";
import util from "../styles/util.module.css";
import PageContainer from "../HOC/PageContainer";
import { useTheme } from "next-themes";
import CraftContent from "../components/CraftContent";
import { fetchCraftPage } from "../lib/craft";

export default function Home({ craftContent, error }) {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  return (
    <PageContainer clientOnly={true}>
      <main className={util.main}>
        <div className={styles.homeHeader}>
          <div className={styles.homeGreetingTitle}>
            <h1>Hello I&apos;am Vaishak</h1>
            <h1>Kaippanchery</h1>
          </div>
          <div>
            <div className={styles.homeSubtitle}>
              <p>
                Making things<span>.</span>
              </p>
              <p>
                Writing code<span>.</span>
              </p>
              <p>
                Minimalist<span>.</span>
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className={util.content}>
            <p>Unable to load content. Please try again later.</p>
          </div>
        ) : (
          <CraftContent content={craftContent} darkMode={isDarkMode} />
        )}
      </main>
    </PageContainer>
  );
}

export async function getStaticProps() {
  const { content, error } = await fetchCraftPage(process.env.CRAFT_HOME_ID);

  return {
    props: {
      craftContent: content || "",
      error: error || null,
    },
    revalidate: 60,
  };
}
