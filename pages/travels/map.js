import React, { useState } from 'react';
import { NotionAPI } from 'notion-client';
import Link from 'next/link';
import { idToUuid, getTextContent, getDateValue } from 'notion-utils';
import { geocodeTravels } from '../../lib/geocoding';
import PageContainer from '../../HOC/PageContainer';
import ClientOnly from '../../HOC/ClientOnly';
import TravelMap from '../../components/TravelMap/TravelMap';
import TravelStats from '../../components/TravelStats/TravelStats';
import util from '../../styles/util.module.css';
import mapStyles from './map.module.css';

const TravelsMapPage = ({ travels, allYears }) => {
  const title = 'Travel Map';
  const description = 'Interactive map of all my travels around the world';
  const [selectedYear, setSelectedYear] = useState(null);

  // Filter travels based on selected year
  const filteredTravels = selectedYear === null
    ? travels
    : travels.filter(travel => travel.year === selectedYear);

  const toggleYear = (year) => {
    setSelectedYear(prev => prev === year ? null : year);
  };

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={mapStyles.header}>
          <div className={mapStyles.headerContent}>
            <div className={util.title}>
              <h1>{title}</h1>
            </div>
            <p className={mapStyles.mapDescription}>{description}</p>
          </div>
          <Link href="/travels" className={mapStyles.backLink}>
            ← Back to Travels
          </Link>
        </div>

        <TravelStats travels={filteredTravels} />

        <ClientOnly>
          <TravelMap
            travels={filteredTravels}
            allYears={allYears}
            selectedYear={selectedYear}
            onYearToggle={toggleYear}
          />
        </ClientOnly>
      </main>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const pageId = process.env.NOTION_TRAVELS_ID;

    if (!pageId) {
      throw new Error('NOTION_TRAVELS_ID is not defined in environment variables');
    }

    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });

    const recordMap = await notion.getPage(pageId);

    // Extract collection (database) data
    const collection = Object.values(recordMap.collection)[0]?.value;
    const collectionView = Object.values(recordMap.collection_view)[0]?.value;
    const collectionQuery = recordMap.collection_query;

    if (!collection || !collectionView || !collectionQuery) {
      return {
        props: { travels: [], allYears: [] },
        revalidate: 60,
      };
    }

    const schema = collection.schema;

    // Extract page IDs from collection query (same logic as index.js)
    const views = Object.values(collectionQuery)[0];
    const pageIds = [];

    Object.values(views).forEach((view) => {
      view?.collection_group_results?.blockIds?.forEach((id) => {
        if (!pageIds.includes(id)) {
          pageIds.push(id);
        }
      });
    });

    const travels = [];

    // Parse each travel entry
    for (const id of pageIds) {
      const block = recordMap.block[id]?.value;

      if (!block) continue;

      const properties = block.properties;

      if (!properties) continue;

      const travel = {
        id: id,
        title: '',
        startDate: null,
        endDate: null,
        year: null,
        countries: [],
        status: '',
        location: '',
      };

      // Parse properties using schema
      for (const [key, val] of Object.entries(properties)) {
        if (!schema[key]) continue;

        const propName = schema[key].name;
        const propType = schema[key].type;

        if (propName === 'Name' || propName === 'Title' || propType === 'title') {
          travel.title = getTextContent(val);
        } else if (propType === 'date') {
          const dateValue = getDateValue(val);
          travel.startDate = dateValue?.start_date;
          travel.endDate = dateValue?.end_date;
          if (travel.startDate) {
            travel.year = new Date(travel.startDate).getFullYear();
          }
        } else if (propType === 'multi_select' && propName.toLowerCase() === 'country') {
          const countries = val.flat().filter(v => typeof v === 'string');
          if (countries.length > 0) {
            travel.countries = countries.flatMap(country =>
              country.split(',').map(c => c.trim())
            );
          }
        } else if (propType === 'select' && propName.toLowerCase() === 'status') {
          travel.status = getTextContent(val);
        } else if ((propType === 'text' || propType === 'rich_text') && propName.toLowerCase() === 'location') {
          travel.location = getTextContent(val);
        }
      }

      // Only include published travels with location data
      const isPublished = travel.status.toLowerCase() === 'published';

      if (travel.title && isPublished && travel.location) {
        travels.push(travel);
      }
    }

    // Geocode travels
    const travelsWithCoordinates = await geocodeTravels(travels);

    // Extract all unique years (sorted newest first)
    const allYearsSet = new Set();
    travelsWithCoordinates.forEach(travel => {
      if (travel.year) {
        allYearsSet.add(travel.year);
      }
    });
    const allYears = Array.from(allYearsSet).sort((a, b) => b - a);

    return {
      props: {
        travels: travelsWithCoordinates,
        allYears,
      },
      revalidate: 60,
    };
  } catch (error) {
    // Return empty array on error
    return {
      props: {
        travels: [],
        allYears: [],
      },
      revalidate: 60,
    };
  }
}

export default TravelsMapPage;
