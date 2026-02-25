/**
 * CMS source configuration.
 *
 * Maps each content area to its data provider and identifier.
 * To migrate a page from Notion to Craft:
 *   1. Add the Craft document ID to .env.local (e.g. CRAFT_NOW_ID=...)
 *   2. Change `provider` to 'craft' and update `pageId` / `collectionId`
 *
 * provider: 'craft' | 'notion'
 * pageId: used by getPageContent()
 * collectionId: used by getCollectionItems() / getCollectionItem()
 */
export const CMS_SOURCES = {
  home: {
    provider: "craft",
    pageId: process.env.CRAFT_HOME_ID,
  },
  notes: {
    provider: "notion",
    collectionId: process.env.NOTION_NOTES_ID,
  },
  now: {
    provider: "notion",
    pageId: process.env.NOTION_NOW_ID,
  },
  colophon: {
    provider: "notion",
    pageId: process.env.NOTION_COLOPHON_ID,
  },
  work: {
    provider: "craft",
    pageId: process.env.CRAFT_WORK_ID,
  },
  travels: {
    provider: "notion",
    collectionId: process.env.NOTION_TRAVELS_ID,
  },
  topReads: {
    provider: "notion",
    collectionId: process.env.NOTION_ARTICLES_ID,
  },
};
