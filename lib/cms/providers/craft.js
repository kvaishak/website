const CRAFT_API_BASE = "https://connect.craft.do/links/6ohTiZBkGG3/api/v1";

/**
 * Fetches a page from the Craft API and returns normalized PageContent.
 * Uses the JSON endpoint to preserve block metadata (color, textStyle, etc.)
 * for rich rendering via CraftBlockRenderer.
 * @param {string} pageId
 * @returns {Promise<{ title: string, markdown: string, rawData: { provider: 'craft', blocks: Array } }>}
 */
export async function getPage(pageId) {
  const response = await fetch(`${CRAFT_API_BASE}/blocks?id=${pageId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Craft API error: ${response.status}`);
  }

  const data = await response.json();
  const blocks = data.content ?? [];
  const title = (data.markdown ?? "").replace(/<\/?page>/g, "").trim();

  // Derive a markdown string from blocks as a plain-text fallback
  const markdown = blocks
    .filter((b) => b.markdown?.trim())
    .map((b) => {
      let md = b.markdown.trim();
      md = md.replace(
        /<callout>([\s\S]*?)<\/callout>/g,
        (_, inner) => `> ${inner.trim()}`
      );
      return md;
    })
    .join("\n\n");

  return {
    title,
    markdown,
    rawData: { provider: "craft", blocks },
  };
}

/**
 * Fetches collection items from a Craft collection.
 * Returns normalized CollectionItem array.
 * @param {string} collectionId
 * @returns {Promise<Array<{ id: string, title: string, date: string|null, status: string, tags: string[], properties: object, markdown: string }>>}
 */
export async function getCollectionItems(collectionId) {
  const response = await fetch(
    `${CRAFT_API_BASE}/collections/${collectionId}/items`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Craft API error: ${response.status}`);
  }

  const data = await response.json();
  const items = data.items ?? [];

  return items.map((item) => {
    const props = item.properties ?? {};
    const contentBlocks = item.content ?? [];
    const markdown = contentBlocks.map((b) => b.markdown ?? "").join("\n\n");

    return {
      id: item.id,
      title: item.title ?? "",
      date: props.date ?? props.Date ?? null,
      status: props.status ?? props.Status ?? "",
      tags: normalizeTags(props.tags ?? props.Tags),
      properties: props,
      markdown,
      rawData: { provider: "craft" },
    };
  });
}


function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  return [];
}
