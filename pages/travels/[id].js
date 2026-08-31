import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { idToUuid, uuidToId, getBlockValue, getBlockTitle, getPageProperty, getTextContent, getDateValue } from "notion-utils";
import util from "../../styles/util.module.css";
import travelStyles from "./[id].module.css";
import PageContainer from "../../HOC/PageContainer";

// Format duration for date ranges
function formatDuration(startDate, endDate) {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (!end) {
    // Single day trip
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();

  // Same month and year: "Dec 20 - 28, 2024"
  if (startYear === endYear && startMonth === endMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${startYear}`;
  }

  // Same year, different months: "Dec 28 - Jan 3, 2024"
  if (startYear === endYear) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startYear}`;
  }

  // Different years: "Dec 28, 2024 - Jan 3, 2025"
  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} - ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
}

const TravelPage = ({ recordMap, pageId, travelTitle, travelStartDate, travelEndDate, travelCountries }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  if (!recordMap) {
    return (
      <PageContainer title="Travel" description="" clientOnly={true}>
        <main className={util.main}>
          <p>Travel not found.</p>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={travelTitle} description="" clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>{travelTitle}</h1>
        </div>

        <div className={travelStyles.travelMeta}>
          {travelStartDate && (
            <span className={travelStyles.travelDuration}>
              {formatDuration(travelStartDate, travelEndDate)}
            </span>
          )}
          {travelCountries && travelCountries.length > 0 && (
            <span className={travelStyles.travelCountries}>
              {travelCountries.map((country, idx) => (
                <span key={idx} className={travelStyles.countryTag}>
                  {country}
                </span>
              ))}
            </span>
          )}
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
          rootPageId={pageId}
        />
      </main>
    </PageContainer>
  );
};

export async function getStaticPaths() {
  // If Notion is unreachable (403/network), skip pre-render so the rest of
  // the site can still build. fallback: 'blocking' regenerates on demand.
  try {
    const pageId = process.env.NOTION_TRAVELS_ID;
    if (!pageId) {
      return { paths: [], fallback: "blocking" };
    }

    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });
    const recordMap = await notion.getPage(pageId);

    const block = recordMap.block;
    const collectionQuery = recordMap.collection_query ?? {};
    const views = Object.values(collectionQuery)[0];
    const pageIds = [];
    if (views && typeof views === "object" && !Array.isArray(views)) {
      Object.values(views).forEach((view) => {
        view?.collection_group_results?.blockIds?.forEach((id) => {
          if (!pageIds.includes(id)) {
            pageIds.push(id);
          }
        });
      });
    }

    function getBlock(blockMap, id) {
      for (const key of [id, id.includes("-") ? uuidToId(id) : idToUuid(id)]) {
        const entry = blockMap[key];
        if (entry) { const b = getBlockValue(entry); if (b) return b; }
      }
      return null;
    }

    const paths = [];
    for (const id of pageIds) {
      const pageBlock = getBlock(block, id);
      if (!pageBlock) continue;

      const statusRaw = getPageProperty("Status", pageBlock, recordMap) ?? getPageProperty("status", pageBlock, recordMap);
      const status = (typeof statusRaw === "string" ? statusRaw : String(statusRaw ?? "")).toLowerCase().trim();
      if (status === "published") {
        paths.push({ params: { id } });
      }
    }

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error building travel paths (Notion unreachable):", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });

    const databaseId = process.env.NOTION_TRAVELS_ID;
    const databaseRecordMap = await notion.getPage(databaseId);
    const dbBlock = databaseRecordMap.block;
    const pageBlock = getBlockValue(dbBlock[id]) ?? getBlockValue(dbBlock[idToUuid(id)]) ?? getBlockValue(dbBlock[uuidToId(id)]);
    if (!pageBlock) {
      return { notFound: true };
    }

    const recordMap = await notion.getPage(id);
    const uuid = idToUuid(id);

    const travelTitle = getBlockTitle(pageBlock, databaseRecordMap) || "Travel";
    const dateProp = getPageProperty("Date", pageBlock, databaseRecordMap) ?? getPageProperty("date", pageBlock, databaseRecordMap);
    const travelStartDate = dateProp?.start_date ?? (typeof dateProp === "string" ? dateProp : null);
    const travelEndDate = dateProp?.end_date ?? null;
    let travelCountries = getPageProperty("Country", pageBlock, databaseRecordMap) ?? getPageProperty("country", pageBlock, databaseRecordMap);
    if (!Array.isArray(travelCountries)) {
      travelCountries = typeof travelCountries === "string" ? travelCountries.split(",").map(c => c.trim()) : [];
    }

    return {
      props: {
        recordMap,
        pageId: uuid,
        travelTitle,
        travelStartDate,
        travelEndDate,
        travelCountries,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching travel:", error);
    return {
      props: {
        recordMap: null,
        pageId: null,
        travelTitle: 'Travel',
        travelStartDate: null,
        travelEndDate: null,
        travelCountries: [],
      },
      revalidate: 60,
    };
  }
}

export default TravelPage;
