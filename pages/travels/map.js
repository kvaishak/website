import React, { useState } from 'react';
import { NotionAPI } from 'notion-client';
import Link from 'next/link';
import { idToUuid, uuidToId, getBlockValue, getTextContent, getDateValue } from 'notion-utils';
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

    // Resolve collection schema (double-wrapped; use getBlockValue)
    let schema = {};
    for (const rec of Object.values(recordMap.collection || {})) {
      const c = getBlockValue(rec);
      if (c?.schema && Object.keys(c.schema).length > 0) {
        schema = c.schema;
        break;
      }
    }

    const collectionQuery = recordMap.collection_query;
    if (!collectionQuery || Object.keys(schema).length === 0) {
      return {
        props: { travels: [], allYears: [] },
        revalidate: 60,
      };
    }

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

    function getBlock(id) {
      for (const key of [id, id.includes("-") ? uuidToId(id) : idToUuid(id)]) {
        const entry = recordMap.block[key];
        if (entry) { const b = getBlockValue(entry); if (b) return b; }
      }
      return null;
    }

    const travels = [];
    for (const id of pageIds) {
      const block = getBlock(id);
      if (!block) continue;

      const properties = block.properties;
      if (!properties) continue;

      const travel = {
        id,
        title: '',
        startDate: null,
        endDate: null,
        year: null,
        countries: [],
        status: '',
        location: '',
      };

      for (const [key, val] of Object.entries(properties)) {
        const s = schema[key];
        if (!s) continue;
        const propName = s.name;
        const propType = s.type;

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

      const isPublished = (travel.status || "").toLowerCase() === 'published';
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
