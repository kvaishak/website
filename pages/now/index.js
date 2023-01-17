import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import { NotionRenderer } from "react-notion-x";
import { NotionAPI } from "notion-client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import Wakatime from "../../components/Wakatime/wakatime";
import Reading from "../../components/Reading/reading";

const Now = ({ recordMap, wakatimeData }) => {
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

        <NotionRenderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={isDarkMode}
          className={util.notionContainer}
          components={{
            nextImage: Image,
            nextLink: Link,
          }}
          // rootPageId="5d7c9f2439964f05b4c78b30a7686e8e"
        />

        <Reading />
        <Wakatime data={wakatimeData} />
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  const notion = new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER,
    // authToken: process.env.NOTION_TOKEN_V2,
  });
  const recordMap = await notion.getPage(process.env.NOTION_NOW_ID);

  // Wakatime data fetching
  const response = await fetch(process.env.WAKATIME_URL);
  const wakatimeData = await response.json();

  return {
    props: {
      recordMap,
      wakatimeData,
    },
    revalidate: 60,
  };
}

export default Now;
