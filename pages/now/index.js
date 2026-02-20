import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import { NotionRenderer } from "react-notion-x";
import { NotionAPI } from "notion-client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import Wakatime from "../../components/Wakatime/wakatime";
import Reading from "../../components/Reading/reading";

import { fetchCurrentlyReading } from "../../lib/reading";

const Now = ({ recordMap, wakatimeData, currentlyReading }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";
  const isWakatimeDataPresent = wakatimeData && wakatimeData.data && wakatimeData.data.length > 0;

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

        <Reading data={currentlyReading} />
        {isWakatimeDataPresent && <Wakatime data={wakatimeData} />}
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const pageId = process.env.NOTION_NOW_ID;
    
    // If environment variable is not set, return empty data
    if (!pageId) {
      console.log('ℹ️ NOTION_NOW_ID environment variable is not set. Returning empty data for build.');
      return {
        props: {
          recordMap: { block: {} },
          wakatimeData: null,
          currentlyReading: [],
        },
        revalidate: 60,
      };
    }

    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
      // authToken: process.env.NOTION_TOKEN_V2,
    });
    const recordMap = await notion.getPage(pageId);

    // Wakatime data fetching
    const response = await fetch(process.env.WAKATIME_URL);
    const wakatimeData = await response.json();

    // Currently Reading Books Data from Literal
    const currentlyReading = await fetchCurrentlyReading();

    return {
      props: {
        recordMap,
        wakatimeData,
        currentlyReading,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('❌ Error in getStaticProps for now:', error);
    return {
      props: {
        recordMap: { block: {} },
        wakatimeData: null,
        currentlyReading: [],
      },
      revalidate: 60,
    };
  }
}

export default Now;
