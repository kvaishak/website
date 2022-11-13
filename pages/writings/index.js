import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";

export default function Home() {
  const title = "Writing";
  const description = "A Collection of my Writings over the years.";

  return (
    <PageContainer title={title} description={description}>
      <main className={util.main}>
        <div className={util.title}>{/* <h1>Writings</h1> */}</div>

        <div className={util.content}>
          <p>🚧 Page Under Construction 🚧</p>
        </div>
      </main>
    </PageContainer>
  );
}
