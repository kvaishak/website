import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { idToUuid, uuidToId, getBlockValue, getBlockTitle, getPageProperty } from "notion-utils";
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

  function getBlockById(blockMap, id) {
    const candidates = [id, id.includes("-") ? uuidToId(id) : idToUuid(id)];
    for (const key of candidates) {
      const entry = blockMap[key];
      if (!entry) continue;
      const b = getBlockValue(entry);
      if (b && typeof b === "object") return b;
    }
    return null;
  }

  const paths = [];
  for (const id of pageIds) {
    const pageBlock = getBlockById(block, id);
    if (!pageBlock) continue;

    const statusRaw = getPageProperty("Status", pageBlock, recordMap) ?? getPageProperty("status", pageBlock, recordMap);
    const status = (typeof statusRaw === "string" ? statusRaw : String(statusRaw ?? "")).toLowerCase().trim();
    if (status === "published") {
      paths.push({ params: { id } });
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

    const databaseId = process.env.NOTION_NOTES_ID;
    const databaseRecordMap = await notion.getPage(databaseId);
    const block = databaseRecordMap.block;
    const pageBlock = getBlockValue(block[id]) ?? getBlockValue(block[idToUuid(id)]) ?? getBlockValue(block[uuidToId(id)]);
    if (!pageBlock) {
      return { notFound: true };
    }

    const recordMap = await notion.getPage(id);
    const uuid = idToUuid(id);

    const noteTitle = getBlockTitle(pageBlock, databaseRecordMap) || "Note";
    const dateProp = getPageProperty("Date", pageBlock, databaseRecordMap) ?? getPageProperty("date", pageBlock, databaseRecordMap);
    let noteDate = null;
    if (dateProp != null) {
      if (typeof dateProp === "number") {
        noteDate = new Date(dateProp).toISOString().split("T")[0];
      } else if (typeof dateProp === "object" && dateProp.start_date) {
        noteDate = dateProp.start_date;
      } else if (typeof dateProp === "string") {
        noteDate = dateProp;
      }
    }
    let noteTags = getPageProperty("Tags", pageBlock, databaseRecordMap) ?? getPageProperty("tags", pageBlock, databaseRecordMap);
    if (!Array.isArray(noteTags)) {
      noteTags = typeof noteTags === "string" ? noteTags.split(",").map((t) => t.trim()) : [];
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
