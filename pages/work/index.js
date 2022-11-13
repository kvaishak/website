import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import workStyles from "./index.module.css";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";

const Work = ({ recordMap }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const title = "Work";
  const description = "My Experience in the Field";

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>Work</h1>
        </div>

        <NotionRenderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={isDarkMode}
          className={workStyles.notionContainer}
          components={{
            nextImage: Image,
            nextLink: Link,
          }}
          // rootPageId="5d7c9f2439964f05b4c78b30a7686e8e"
        />
      </main>
    </PageContainer>
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
