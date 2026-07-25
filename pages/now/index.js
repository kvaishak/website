import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import ContentRenderer from "../../components/ContentRenderer";
import { getPageContent } from "../../lib/cms/index.js";
import { useTheme } from "next-themes";
import Reading from "../../components/Reading/reading";

import { fetchCurrentlyReading } from "../../lib/reading";

const Now = ({ content, rawData, error, wakatimeData, currentlyReading }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const title = "Now";
  const description = "What I am doing now, an asynchronous update page.";

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>{title}</h1>
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

        <Reading data={currentlyReading} />
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  let content = "";
  let rawData = { provider: "craft" };
  let error = null;

  try {
    const pageData = await getPageContent("now");
    content = pageData.markdown ?? "";
    rawData = pageData.rawData;
  } catch (err) {
    console.error("Error fetching now page content:", err);
    error = err.message ?? "Unknown error";
  }

  let wakatimeData = { data: [] };
  try {
    if (process.env.WAKATIME_URL) {
      const response = await fetch(process.env.WAKATIME_URL);
      const parsed = await response.json();
      if (parsed && Array.isArray(parsed.data)) {
        wakatimeData = parsed;
      }
    }
  } catch {
    /* fallback on network error */
  }

  let currentlyReading = [];
  try {
    currentlyReading = await fetchCurrentlyReading();
  } catch {
    /* fallback on network error */
  }

  return {
    props: {
      content,
      rawData,
      error,
      wakatimeData,
      currentlyReading,
    },
    revalidate: 60,
  };
}

export default Now;
