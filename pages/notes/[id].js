import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { idToUuid, getTextContent, getDateValue } from "notion-utils";
import util from "../../styles/util.module.css";
import noteStyles from "./[id].module.css";
import PageContainer from "../../HOC/PageContainer";

const NotePage = ({ recordMap, pageId, noteTitle, noteDate, noteTags }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  if (!recordMap) {
    return (
      <PageContainer title="Note" description="" clientOnly={true}>
        <main className={util.main}>
          <p>Note not found.</p>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={noteTitle} description="" clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>{noteTitle}</h1>
        </div>

        <div className={noteStyles.noteMeta}>
          {noteDate && (
            <span className={noteStyles.noteDate}>
              {new Date(noteDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
          {noteTags && noteTags.length > 0 && (
            <span className={noteStyles.noteTags}>
              {noteTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/notes?tags=${encodeURIComponent(tag)}`}
                  className={noteStyles.tagLink}
                >
                  {tag}
                </Link>
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
  const pageId = process.env.NOTION_NOTES_ID;
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

  // Extract published notes
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
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });

    // First, get the database to access schema
    const databaseId = process.env.NOTION_NOTES_ID;
    const databaseRecordMap = await notion.getPage(databaseId);
    const collection = Object.values(databaseRecordMap.collection)[0]?.value;
    const schema = collection?.schema;

    // Fetch the individual note page
    const recordMap = await notion.getPage(id);
    const uuid = idToUuid(id);

    // Get metadata from the database
    const pageBlock = databaseRecordMap.block[id]?.value;
    const properties = pageBlock?.properties || {};

    let noteTitle = 'Note';
    let noteDate = null;
    let noteTags = [];

    // Extract properties based on schema
    for (const [key, val] of Object.entries(properties)) {
      if (!schema[key]) continue;

      const propName = schema[key].name;
      const propType = schema[key].type;

      if (propName === 'Name' || propName === 'Title' || propType === 'title') {
        noteTitle = getTextContent(val);
      } else if (propType === 'date') {
        const dateValue = getDateValue(val);
        noteDate = dateValue?.start_date;
      } else if (propType === 'multi_select' && propName.toLowerCase() === 'tags') {
        const tags = val.flat().filter(v => typeof v === 'string');
        if (tags.length > 0) {
          noteTags = tags.flatMap(tag => tag.split(',').map(t => t.trim()));
        }
      }
    }

    return {
      props: {
        recordMap,
        pageId: uuid,
        noteTitle,
        noteDate,
        noteTags,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching note:", error);
    return {
      props: {
        recordMap: null,
        pageId: null,
        noteTitle: 'Note',
        noteDate: null,
        noteTags: [],
      },
      revalidate: 60,
    };
  }
}

export default NotePage;
