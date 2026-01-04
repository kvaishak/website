import React from "react";
import { NotionAPI } from "notion-client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { idToUuid, getTextContent, getDateValue } from "notion-utils";
import travelsStyles from "./index.module.css";
import util from "../../styles/util.module.css";
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

const Travels = ({ travels, allYears }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const router = useRouter();
  const [selectedYear, setSelectedYear] = React.useState(null);

  // Initialize selected year from URL on mount
  React.useEffect(() => {
    if (router.isReady) {
      const yearFromUrl = router.query.year;
      if (yearFromUrl) {
        setSelectedYear(parseInt(yearFromUrl));
      }
    }
  }, [router.isReady, router.query.year]);

  const title = "Travels";
  const description =
    "Stories and reflections from my travels around the world";

  // Filter travels based on selected year
  const filteredTravels = selectedYear === null
    ? travels
    : travels.filter(travel => travel.year === selectedYear);

  const toggleYear = (year) => {
    setSelectedYear(prev => {
      const newYear = prev === year ? null : year;

      // Update URL with new year
      const query = newYear !== null
        ? { year: newYear }
        : {};

      router.push(
        {
          pathname: router.pathname,
          query: query,
        },
        undefined,
        { shallow: true }
      );

      return newYear;
    });
  };

  if (!travels || travels.length === 0) {
    return (
      <PageContainer title={title} description={description} clientOnly={true}>
        <main className={util.main}>
          <div className={util.title}>
            <h1>{title}</h1>
          </div>
          <p>No travels found.</p>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>{title}</h1>
        </div>

        <div className={travelsStyles.container}>
          <div className={travelsStyles.gap}>&nbsp;</div>
          <p>{description}</p>
          <div className={travelsStyles.gap}>&nbsp;</div>

          {/* Year Filter Section */}
          {allYears && allYears.length > 0 && (
            <div className={travelsStyles.yearFilterContainer}>
              {allYears.map((year) => (
                <button
                  key={year}
                  className={`${travelsStyles.yearButton} ${
                    selectedYear === year ? travelsStyles.yearButtonActive : ''
                  }`}
                  onClick={() => toggleYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {filteredTravels.length === 0 ? (
            <p className={travelsStyles.noResults}>
              No travels found for {selectedYear}.
            </p>
          ) : (
            filteredTravels.map((travel) => (
              <div key={travel.id} className={travelsStyles.travelsItem}>
                <Link href={`/travels/${travel.id}`}>
                  <div>
                    <div className={travelsStyles.travelsItem__title}>
                      {travel.title}
                    </div>
                    <div className={travelsStyles.travelsItem__meta}>
                      {travel.startDate && (
                        <span className={travelsStyles.travelsItem__duration}>
                          {formatDuration(travel.startDate, travel.endDate)}
                        </span>
                      )}
                      {travel.countries && travel.countries.length > 0 && (
                        <span className={travelsStyles.travelsItem__countries}>
                          {travel.countries.map((country, idx) => (
                            <span key={idx} className={travelsStyles.countryTag}>
                              {country}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const pageId = process.env.NOTION_TRAVELS_ID;
    const notion = new NotionAPI();
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

    // Extract travel data
    const travels = [];
    for (const id of pageIds) {
      const pageBlock = block[id]?.value;
      if (!pageBlock) continue;

      const properties = pageBlock.properties || {};
      const travel = {
        id,
        title: '',
        startDate: null,
        endDate: null,
        year: null,
        countries: [],
        status: '',
      };

      // Extract properties based on schema
      for (const [key, val] of Object.entries(properties)) {
        if (!schema[key]) continue;

        const propName = schema[key].name;
        const propType = schema[key].type;

        if (propName === 'Name' || propName === 'Title' || propType === 'title') {
          travel.title = getTextContent(val);
        } else if (propType === 'date') {
          // Duration property (date range)
          const dateValue = getDateValue(val);
          travel.startDate = dateValue?.start_date;
          travel.endDate = dateValue?.end_date;
          // Extract year from start date
          if (travel.startDate) {
            travel.year = new Date(travel.startDate).getFullYear();
          }
        } else if (propType === 'multi_select' && propName.toLowerCase() === 'country') {
          // For multi_select countries
          const countries = val.flat().filter(v => typeof v === 'string');
          if (countries.length > 0) {
            travel.countries = countries.flatMap(country =>
              country.split(',').map(c => c.trim())
            );
          }
        } else if (propType === 'select' && propName.toLowerCase() === 'status') {
          // For status select field
          travel.status = getTextContent(val);
        }
      }

      // Only include travels with title and 'published' status
      const isPublished = travel.status.toLowerCase() === 'published';

      if (travel.title && isPublished) {
        travels.push(travel);
      }
    }

    // Sort by start date (newest first)
    travels.sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(b.startDate) - new Date(a.startDate);
    });

    // Extract all unique years (sorted newest first)
    const allYearsSet = new Set();
    travels.forEach(travel => {
      if (travel.year) {
        allYearsSet.add(travel.year);
      }
    });
    const allYears = Array.from(allYearsSet).sort((a, b) => b - a);

    console.log(`✅ Extracted ${travels.length} travels`);
    console.log(`✅ Found ${allYears.length} unique years:`, allYears);
    if (travels.length > 0) {
      console.log('Sample travel:', JSON.stringify(travels[0], null, 2));
    }

    return {
      props: {
        travels,
        allYears,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("❌ Error fetching Notion page:", error);
    return {
      props: {
        travels: [],
        allYears: [],
      },
      revalidate: 60,
    };
  }
}

export default Travels;
