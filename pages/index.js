import styles from "./index.module.css";
import util from "../styles/util.module.css";
// import Image from "next/image";
const { Client } = require("@notionhq/client");
import PageContainer from "../HOC/PageContainer";

export default function Home({ list }) {
  const content =
    list &&
    list.map((element) => {
      const data = element[element.type].rich_text[0].plain_text;
      return <p key={element.id}>{data}</p>;
    });

  const title = "Home";
  const description = "My Home Page";

  return (
    <PageContainer title={title} description={description}>
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
              <p>Making things.</p>
              <p>Writing code.</p>
              <p>Minimalist.</p>
            </div>
          </div>
        </div>

        <div className={util.content}>{content}</div>
      </main>
    </PageContainer>
  );
}

//notion API
export async function getStaticProps() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  const response = await notion.blocks.children.list({
    block_id: process.env.NOTION_HOME_ID,
    page_size: 50,
  });

  return {
    props: {
      list: response.results,
    },
    revalidate: 60,
  };
}
