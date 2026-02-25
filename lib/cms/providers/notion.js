import { NotionAPI } from "notion-client";
import {
  getBlockValue,
  getBlockTitle,
  getPageProperty,
  getTextContent,
  getDateValue,
  idToUuid,
  uuidToId,
} from "notion-utils";

function createNotionClient() {
  return new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER,
  });
}

/**
 * Fetches a single Notion page and returns normalized PageContent.
 * The `rawData.recordMap` is passed to NotionRenderer for rich rendering.
 * @param {string} pageId
 * @returns {Promise<{ title: string, markdown: null, rawData: { provider: 'notion', recordMap: object } }>}
 */
export async function getPage(pageId) {
  const notion = createNotionClient();
  const recordMap = await notion.getPage(pageId);

  const rootBlock = getBlockValue(recordMap.block[idToUuid(pageId)]) ??
    getBlockValue(recordMap.block[pageId]);
  const title = rootBlock ? getBlockTitle(rootBlock, recordMap) : "";

  return {
    title,
    markdown: null,
    rawData: { provider: "notion", recordMap },
  };
}

/**
 * Fetches items from a Notion database page and returns normalized CollectionItems.
 * Only includes items where status === "published".
 * @param {string} databasePageId
 * @returns {Promise<Array<{ id: string, title: string, date: string|null, status: string, tags: string[], rawData: { provider: 'notion', recordMap: object } }>>}
 */
export async function getCollectionItems(databasePageId) {
  const notion = createNotionClient();
  const recordMap = await notion.getPage(databasePageId);

  const block = recordMap.block;

  const collectionQuery = recordMap.collection_query ?? {};
  const views = Object.values(collectionQuery)[0];
  const pageIds = [];
  if (views && typeof views === "object" && !Array.isArray(views)) {
    Object.values(views).forEach((view) => {
      view?.collection_group_results?.blockIds?.forEach((id) => {
        if (!pageIds.includes(id)) pageIds.push(id);
      });
    });
  }

  let schema = {};
  for (const rec of Object.values(recordMap.collection || {})) {
    const c = getBlockValue(rec);
    if (c?.schema && Object.keys(c.schema).length > 0) {
      schema = c.schema;
      break;
    }
  }

  const items = [];
  for (const id of pageIds) {
    const pageBlock = getBlockById(block, id);
    if (!pageBlock) continue;

    const properties = pageBlock.properties ?? {};
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
        date = d?.start_date ?? null;
      } else if (type === "multi_select" && name === "tags") {
        const raw = (val && Array.isArray(val) ? val.flat() : []).filter(
          (v) => typeof v === "string"
        );
        tags = raw
          .flatMap((t) => t.split(",").map((x) => x.trim()))
          .filter(Boolean);
      }
    }

    if (title) {
      items.push({
        id,
        title,
        date,
        status,
        tags,
        properties,
        markdown: null,
        rawData: { provider: "notion", recordMap },
      });
    }
  }

  items.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  return items;
}

/**
 * Fetches a single note/item page from Notion with its metadata from the parent database.
 * @param {string} itemId - The page block ID
 * @param {string} databasePageId - The parent database page ID for metadata lookup
 * @returns {Promise<{ title: string, date: string|null, tags: string[], rawData: { provider: 'notion', recordMap: object, pageId: string } }>}
 */
export async function getCollectionItem(itemId, databasePageId) {
  const notion = createNotionClient();

  const databaseRecordMap = await notion.getPage(databasePageId);
  const block = databaseRecordMap.block;

  const pageBlock =
    getBlockValue(block[itemId]) ??
    getBlockValue(block[idToUuid(itemId)]) ??
    getBlockValue(block[uuidToId(itemId)]);

  if (!pageBlock) return null;

  const recordMap = await notion.getPage(itemId);
  const uuid = idToUuid(itemId);

  const title = getBlockTitle(pageBlock, databaseRecordMap) || "";

  const dateProp =
    getPageProperty("Date", pageBlock, databaseRecordMap) ??
    getPageProperty("date", pageBlock, databaseRecordMap);
  let date = null;
  if (dateProp != null) {
    if (typeof dateProp === "number") {
      date = new Date(dateProp).toISOString().split("T")[0];
    } else if (typeof dateProp === "object" && dateProp.start_date) {
      date = dateProp.start_date;
    } else if (typeof dateProp === "string") {
      date = dateProp;
    }
  }

  let tags =
    getPageProperty("Tags", pageBlock, databaseRecordMap) ??
    getPageProperty("tags", pageBlock, databaseRecordMap);
  if (!Array.isArray(tags)) {
    tags =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
  }

  const statusRaw =
    getPageProperty("Status", pageBlock, databaseRecordMap) ??
    getPageProperty("status", pageBlock, databaseRecordMap);
  const status = (
    typeof statusRaw === "string" ? statusRaw : String(statusRaw ?? "")
  ).toLowerCase().trim();

  return {
    id: itemId,
    title,
    date,
    tags,
    status,
    markdown: null,
    rawData: { provider: "notion", recordMap, pageId: uuid },
  };
}

/**
 * Checks if a Notion collection item is published.
 * @param {string} itemId
 * @param {object} recordMap
 * @returns {boolean}
 */
export function isPublished(itemId, recordMap) {
  const block = recordMap.block;
  const pageBlock = getBlockById(block, itemId);
  if (!pageBlock) return false;
  const statusRaw =
    getPageProperty("Status", pageBlock, recordMap) ??
    getPageProperty("status", pageBlock, recordMap);
  const status = (
    typeof statusRaw === "string" ? statusRaw : String(statusRaw ?? "")
  ).toLowerCase().trim();
  return status === "published";
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
