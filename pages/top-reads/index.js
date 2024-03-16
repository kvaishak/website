import { NotionAPI } from "notion-client";
import { useTheme } from "next-themes";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import ArticlesList from "../../components/ArticlesList/articlesList";

const entryBindings = {
  link: "wQg%",
  about: ")*Uq",
  author: "7b61d872-971a-402a-9b64-097f79dd53a0",
  expose: "lxVJ",
};

const Articles = ({ recordMap }) => {
  const { theme, systemTheme } = useTheme();

  const title = "Top Reads";
  const description =
    "A curated list of written content, including articles, Twitter links, blogs, and more, that I personally enjoyed reading.";

  const { block } = recordMap;
  const finalArticleList = [];
  for (const element in recordMap.block) {
    if (
      block[element].value.type === "page" &&
      block[element].value.properties[entryBindings.link] &&
      block[element].value.properties[entryBindings.expose]
    ) {
      finalArticleList.push({
        title: block[element].value.properties.title[0][0],
        link: block[element].value.properties[entryBindings.link][0][0],
        about: block[element].value.properties[entryBindings.about]
          ? block[element].value.properties[entryBindings.about][0][0]
          : "",
        author: block[element].value.properties[entryBindings.author]
          ? block[element].value.properties[entryBindings.author][0][0]
          : "",
      });
    }
  }

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>{title}</h1>
        </div>

        <ArticlesList data={finalArticleList} />
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  const notion = new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER,
    // authToken: process.env.NOTION_TOKEN_V2,
  });
  const recordMap = await notion.getPage(process.env.NOTION_ARTICLES_ID);

  return {
    props: {
      recordMap,
    },
    revalidate: 60,
  };
}

export default Articles;
