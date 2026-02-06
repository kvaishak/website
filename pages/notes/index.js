import React from "react";
import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { idToUuid, getTextContent, getDateValue } from "notion-utils";
import notesStyles from "./index.module.css";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";

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

    // Extract note data
    const notes = [];
    for (const id of pageIds) {
      const pageBlock = block[id]?.value;
      if (!pageBlock) continue;

      const properties = pageBlock.properties || {};
      const note = {
        id,
        title: '',
        date: null,
        tags: [],
        status: '',
      };

      // Extract properties based on schema
      for (const [key, val] of Object.entries(properties)) {
        if (!schema[key]) continue;

        const propName = schema[key].name;
        const propType = schema[key].type;

        if (propName === 'Name' || propName === 'Title' || propType === 'title') {
          note.title = getTextContent(val);
        } else if (propType === 'date') {
          const dateValue = getDateValue(val);
          note.date = dateValue?.start_date;
        } else if (propType === 'multi_select' && propName.toLowerCase() === 'tags') {
          // For multi_select tags, the value is an array of arrays
          const tags = val.flat().filter(v => typeof v === 'string');
          if (tags.length > 0) {
            // Split comma-separated tags and trim whitespace
            note.tags = tags.flatMap(tag => tag.split(',').map(t => t.trim()));
          }
        } else if (propType === 'select' && propName.toLowerCase() === 'status') {
          // For status select field
          note.status = getTextContent(val);
        }
      }

      // Only include notes with title and 'published' status
      const isPublished = note.status.toLowerCase() === 'published';

      if (note.title && isPublished) {
        notes.push(note);
      }
    }

    // Sort by date (newest first)
    notes.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    // Extract all unique tags
    const allTagsSet = new Set();
    notes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => allTagsSet.add(tag));
      }
    });
    const allTags = Array.from(allTagsSet).sort();

    console.log(`✅ Extracted ${notes.length} notes`);
    console.log(`✅ Found ${allTags.length} unique tags:`, allTags);
    if (notes.length > 0) {
      console.log('Sample note:', JSON.stringify(notes[0], null, 2));
    }

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
