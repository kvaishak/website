import { CMS_SOURCES } from "./config.js";
import * as craftProvider from "./providers/craft.js";
import * as notionProvider from "./providers/notion.js";

const providers = {
  craft: craftProvider,
  notion: notionProvider,
};

function getProvider(source) {
  const provider = providers[source.provider];
  if (!provider) {
    throw new Error(`Unknown CMS provider: "${source.provider}"`);
  }
  return provider;
}

/**
 * Fetches the content of a named page from its configured CMS provider.
 *
 * @param {keyof typeof CMS_SOURCES} name - The page name as defined in config.js
 * @returns {Promise<{ title: string, markdown: string|null, rawData: object }>}
 */
export async function getPageContent(name) {
  const source = CMS_SOURCES[name];
  if (!source) throw new Error(`No CMS source configured for: "${name}"`);
  if (!source.pageId) throw new Error(`No pageId configured for: "${name}"`);

  const provider = getProvider(source);
  return provider.getPage(source.pageId);
}

/**
 * Fetches all items from a named collection from its configured CMS provider.
 * For Notion, only items with status "published" should be filtered by the caller.
 *
 * @param {keyof typeof CMS_SOURCES} name - The collection name as defined in config.js
 * @returns {Promise<Array<{ id: string, title: string, date: string|null, status: string, tags: string[], markdown: string|null, rawData: object }>>}
 */
export async function getCollectionItems(name) {
  const source = CMS_SOURCES[name];
  if (!source) throw new Error(`No CMS source configured for: "${name}"`);
  if (!source.collectionId)
    throw new Error(`No collectionId configured for: "${name}"`);

  const provider = getProvider(source);
  return provider.getCollectionItems(source.collectionId);
}

/**
 * Fetches a single collection item (e.g. a note or travel entry) by its ID.
 * Only available for providers that support per-item fetching (Notion).
 *
 * @param {keyof typeof CMS_SOURCES} name - The collection name as defined in config.js
 * @param {string} itemId - The item ID
 * @returns {Promise<{ id: string, title: string, date: string|null, tags: string[], status: string, markdown: string|null, rawData: object } | null>}
 */
export async function getCollectionItem(name, itemId) {
  const source = CMS_SOURCES[name];
  if (!source) throw new Error(`No CMS source configured for: "${name}"`);
  if (!source.collectionId)
    throw new Error(`No collectionId configured for: "${name}"`);

  const provider = getProvider(source);

  if (source.provider === "notion") {
    return notionProvider.getCollectionItem(itemId, source.collectionId);
  }

  // For Craft, fetch by item ID directly
  return craftProvider.getPage(itemId);
}

/**
 * Returns the provider name for a given CMS source.
 * Useful for conditional rendering (e.g. NotionRenderer vs CraftContent).
 *
 * @param {keyof typeof CMS_SOURCES} name
 * @returns {'craft' | 'notion'}
 */
export function getProviderName(name) {
  const source = CMS_SOURCES[name];
  if (!source) throw new Error(`No CMS source configured for: "${name}"`);
  return source.provider;
}
