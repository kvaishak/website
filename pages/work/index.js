import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import ClientOnly from "../../HOC/ClientOnly";
import workStyles from "./index.module.css";

const Work = ({ recordMap }) => {
  console.log(recordMap);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <ClientOnly>
      <div className={styles.container}>
        <Head>
          <title>Work | shak&apos;s corner</title>
          <meta name="description" content="I am working" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.homeHeader}>
            <div className={styles.title}>
              <h1>Work</h1>
            </div>
          </div>

          <NotionRenderer
            recordMap={recordMap}
            fullPage={false}
            darkMode={isDarkMode}
            className={workStyles.notionContainer}
            // rootPageId="5d7c9f2439964f05b4c78b30a7686e8e"
          />
        </main>
      </div>
    </ClientOnly>
  );
};

export async function getStaticProps() {
  const notion = new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER,
    authToken: process.env.NOTION_TOKEN_V2,
  });
  const recordMap = await notion.getPage(process.env.NOTION_WORK_ID);

  return {
    props: {
      recordMap,
    },
    revalidate: 60,
  };
}

export default Work;
