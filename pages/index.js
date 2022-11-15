import styles from "./index.module.css";
import util from "../styles/util.module.css";
// import Image from "next/image";
const { Client } = require("@notionhq/client");
import PageContainer from "../HOC/PageContainer";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Link from "next/link";
import { NotionAPI } from "notion-client";
import Image from "next/image";

export default function Home({ recordMap }) {
  // const content =
  //   list &&
  //   list.map((element) => {
  //     const data = element[element.type].rich_text[0].plain_text;
  //     return <p key={element.id}>{data}</p>;
  //   });

  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const title = "Home";
  const description = "My Home Page";

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={styles.homeHeader}>
          <div className={styles.homeGreetingTitle}>
            <h1>Hello I&apos;am Vaishak</h1>
            <h1>Kaippanchery</h1>
          </div>
          <div>
            {/* <Image
              priority
              // className={iconClassName}
              src={`/icons/Corner.svg`}
              height={120}
              width={120}
              alt="Theme-changer"
              // onClick={clickHander}
            /> */}
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

        {/* <div className={util.content}>{content}</div> */}

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
      </main>
    </PageContainer>
  );
}

//notion API
export async function getStaticProps() {
  // const notion = new Client({ auth: process.env.NOTION_API_KEY });

  // const response = await notion.blocks.children.list({
  //   block_id: process.env.NOTION_HOME_ID,
  //   page_size: 50,
  // });

  // return {
  //   props: {
  //     list: response.results,
  //   },
  //   revalidate: 60,
  // };

  const notion = new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER,
    authToken: process.env.NOTION_TOKEN_V2,
  });
  const recordMap = await notion.getPage(process.env.NOTION_HOME_ID);

  return {
    props: {
      recordMap,
    },
    revalidate: 60,
  };
}
