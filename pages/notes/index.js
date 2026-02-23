import React from "react";
import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { idToUuid, uuidToId, getBlockValue, getDateValue, getTextContent } from "notion-utils";
import notesStyles from "./index.module.css";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";

// Get block by id; recordMap.block entries can be double-wrapped (.value.value); use getBlockValue to unwrap
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

const Notes = ({ notes, allTags }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const router = useRouter();
  const [selectedTags, setSelectedTags] = React.useState([]);

  // Initialize selected tags from URL on mount
  React.useEffect(() => {
    if (router.isReady) {
      const tagsFromUrl = router.query.tags;
      if (tagsFromUrl) {
        const tagsArray = Array.isArray(tagsFromUrl)
          ? tagsFromUrl
          : tagsFromUrl.split(',').filter(Boolean);
        setSelectedTags(tagsArray);
      }
    }
  }, [router.isReady, router.query.tags]);

  const title = "Notes";
  const description =
    "A collection of my thoughts, learnings, and insights on various topics";

  // Filter notes based on selected tags
  const filteredNotes = selectedTags.length === 0
    ? notes
    : notes.filter(note =>
        selectedTags.every(tag => note.tags.includes(tag))
      );

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];

      // Update URL with new tags
      const query = newTags.length > 0
        ? { tags: newTags.join(',') }
        : {};

      router.push(
        {
          pathname: router.pathname,
          query: query,
        },
        undefined,
        { shallow: true }
      );

      return newTags;
    });
  };

  if (!notes || notes.length === 0) {
    return (
      <PageContainer title={title} description={description} clientOnly={true}>
        <main className={util.main}>
          <div className={util.title}>
            <h1>{title}</h1>
          </div>
          <p>No notes found.</p>
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

        <div className={notesStyles.container}>
          <div className={notesStyles.gap}>&nbsp;</div>
          <p>{description}</p>
          <div className={notesStyles.gap}>&nbsp;</div>

          {/* Tag Filter Section */}
          {allTags && allTags.length > 0 && (
            <div className={notesStyles.tagFilterContainer}>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`${notesStyles.tagButton} ${
                    selectedTags.includes(tag) ? notesStyles.tagButtonActive : ''
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {filteredNotes.length === 0 ? (
            <p className={notesStyles.noResults}>No notes found for the selected tags.</p>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className={notesStyles.notesItem}>
                <Link href={`/notes/${note.id}`}>
                  <div>
                    <div className={notesStyles.notesItem__title}>
                      {note.title}
                    </div>
                    <div className={notesStyles.notesItem__meta}>
                      {note.date && (
                        <span className={notesStyles.notesItem__date}>
                          {new Date(note.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <span className={notesStyles.notesItem__tags}>
                          {note.tags.join(' · ')}
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
    const pageId = process.env.NOTION_NOTES_ID;
    const notion = new NotionAPI({
      activeUser: process.env.NOTION_ACTIVE_USER,
    });
    const recordMap = await notion.getPage(pageId);

    const block = recordMap.block;

    // Get all page IDs from collection_query
    const collectionQuery = recordMap.collection_query;
    const views = Object.values(collectionQuery || {})[0];
    const pageIds = [];
    if (views) {
      Object.values(views).forEach((view) => {
        view?.collection_group_results?.blockIds?.forEach((id) => {
          if (!pageIds.includes(id)) {
            pageIds.push(id);
          }
        });
      });
    }

    // Resolve collection schema (entries are double-wrapped like blocks; use getBlockValue)
    let schema = {};
    for (const rec of Object.values(recordMap.collection || {})) {
      const c = getBlockValue(rec);
      if (c?.schema && Object.keys(c.schema).length > 0) {
        schema = c.schema;
        break;
      }
    }

    // Extract note data from block properties using schema
    const notes = [];
    for (const id of pageIds) {
      const pageBlock = getBlockById(block, id);
      if (!pageBlock) continue;

      const properties = pageBlock.properties || {};
      if (Object.keys(properties).length === 0) continue;
      let title = "";
      let status = "";
      let date = null;
      let tags = [];

      for (const [key, val] of Object.entries(properties)) {
        const s = schema[key];
        if (!s) continue;
        const name = (s.name || "").toLowerCase();
        const type = s.type;
        if (type === "title" || name === "name" || name === "title") {
          title = getTextContent(val) || title;
        } else if (type === "select" && (name === "status" || name === "state")) {
          status = getTextContent(val) || status;
        } else if (type === "date") {
          const d = getDateValue(val);
          date = d?.start_date || null;
        } else if (type === "multi_select" && name === "tags") {
          const raw = (val && Array.isArray(val) ? val.flat() : []).filter((v) => typeof v === "string");
          tags = raw.flatMap((t) => t.split(",").map((x) => x.trim())).filter(Boolean);
        }
      }

      const isPublished = (status || "").toLowerCase().trim() === "published";
      if (title && isPublished) {
        notes.push({ id, title, date, tags, status });
      }
    }

    // Sort by date (newest first)
    notes.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    const allTagsSet = new Set();
    notes.forEach(note => {
      (note.tags || []).forEach(tag => allTagsSet.add(tag));
    });
    const allTags = Array.from(allTagsSet).sort();

    return {
      props: {
        notes,
        allTags,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("❌ Error fetching Notion page:", error);
    return {
      props: {
        notes: [],
        allTags: [],
      },
      revalidate: 60,
    };
  }
}

export default Notes;
