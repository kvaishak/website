import styles from "./index.module.css";
import util from "../styles/util.module.css";
import PageContainer from "../HOC/PageContainer";
import { useTheme } from "next-themes";
import ContentRenderer from "../components/ContentRenderer";
import { getPageContent } from "../lib/cms/index.js";

export default function Home({ content, rawData, error }) {
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
          <ContentRenderer
            rawData={rawData}
            markdown={content}
            darkMode={isDarkMode}
          />
        )}
      </main>
    </PageContainer>
  );
}

export async function getStaticProps() {
  try {
    const { title, markdown, rawData } = await getPageContent("home");
    return {
      props: {
        content: markdown ?? "",
        rawData,
        error: null,
      },
      revalidate: 60,
    };
  } catch (err) {
    console.error("Error fetching home page content:", err);
    return {
      props: {
        content: "",
        rawData: { provider: "craft" },
        error: err.message ?? "Unknown error",
      },
      revalidate: 60,
    };
  }
}
