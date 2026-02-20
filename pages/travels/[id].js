import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { idToUuid, getTextContent, getDateValue } from "notion-utils";
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
  try {
    const pageId = process.env.NOTION_TRAVELS_ID;
    
    // If environment variable is not set, return empty paths
    if (!pageId) {
      console.log('ℹ️ NOTION_TRAVELS_ID environment variable is not set. Returning empty paths for build.');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });
    const recordMap = await notion.getPage(pageId);

    const uuid = idToUuid(pageId);
    const collection = Object.values(recordMap.collection)[0]?.value;
    const block = recordMap.block;
    const schema = collection?.schema;

    // Get all page IDs from collection_query
    const collectionQuery = recordMap.collection_query;
    const views = Object.values(collectionQuery)[0];
    const pageIds = [];

    Object.values(views).forEach((view) => {
      view?.collection_group_results?.blockIds?.forEach((id) => {
        if (!pageIds.includes(id)) {
          pageIds.push(id);
        }
      });
    });

    // Extract published travels
    const paths = [];
    for (const id of pageIds) {
      const pageBlock = block[id]?.value;
      if (!pageBlock) continue;

      const properties = pageBlock.properties || {};
      let status = '';

      // Check if published
      for (const [key, val] of Object.entries(properties)) {
        if (!schema[key]) continue;
        const propName = schema[key].name;
        const propType = schema[key].type;

        if (propType === 'select' && propName.toLowerCase() === 'status') {
          status = getTextContent(val);
          break;
        }
      }

      if (status.toLowerCase() === 'published') {
        paths.push({
          params: { id },
        });
      }
    }

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('❌ Error in getStaticPaths for travels:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    
    // First, get the database to access schema
    const databaseId = process.env.NOTION_TRAVELS_ID;
    
    // If environment variable is not set, return not found
    if (!databaseId) {
      console.log('ℹ️ NOTION_TRAVELS_ID environment variable is not set. Returning empty travel data.');
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

    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });
    
    const databaseRecordMap = await notion.getPage(databaseId);
    const collection = Object.values(databaseRecordMap.collection)[0]?.value;
    const schema = collection?.schema;

    // Fetch the individual travel page
    const recordMap = await notion.getPage(id);
    const uuid = idToUuid(id);

    // Get metadata from the database
    const pageBlock = databaseRecordMap.block[id]?.value;
    const properties = pageBlock?.properties || {};

    let travelTitle = 'Travel';
    let travelStartDate = null;
    let travelEndDate = null;
    let travelCountries = [];

    // Extract properties based on schema
    for (const [key, val] of Object.entries(properties)) {
      if (!schema[key]) continue;

      const propName = schema[key].name;
      const propType = schema[key].type;

      if (propName === 'Name' || propName === 'Title' || propType === 'title') {
        travelTitle = getTextContent(val);
      } else if (propType === 'date') {
        // Duration property (date range)
        const dateValue = getDateValue(val);
        travelStartDate = dateValue?.start_date;
        travelEndDate = dateValue?.end_date;
      } else if (propType === 'multi_select' && propName.toLowerCase() === 'country') {
        const countries = val.flat().filter(v => typeof v === 'string');
        if (countries.length > 0) {
          travelCountries = countries.flatMap(country =>
            country.split(',').map(c => c.trim())
          );
        }
      }
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
