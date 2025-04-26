import { useTheme } from "next-themes";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import travelsData from "./travelData.json";
import TravelHome from "../../components/TravelHome/TravelHome";

const Travels = () => {
  const { theme } = useTheme();

  const title = "My Travels";
  const description = "A timeline of my travels organized by year.";

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={`${util.main} ${util.alignLeft}`}>
        <div className={util.title}>
          <h1>{title}</h1>
        </div>

        <TravelHome travelsData={travelsData} />
      </main>
    </PageContainer>
  );
};

export default Travels;
