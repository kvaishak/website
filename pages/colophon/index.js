import { useTheme } from "next-themes";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import ContentRenderer from "../../components/ContentRenderer";
import { getPageContent } from "../../lib/cms/index.js";

const Colophon = ({ content, rawData, error }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const title = "Colophon";
  const description = "How I Built this website";

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
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const { markdown, rawData } = await getPageContent("colophon");
    return {
      props: {
        content: markdown ?? "",
        rawData,
        error: null,
      },
      revalidate: 60,
    };
  } catch (err) {
    console.error("Error fetching colophon page content:", err);
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

export default Colophon;
