import { idToUuid } from 'notion-utils';

/**
 * Extracts page IDs from a Notion recordMap using multiple fallback strategies.
 * Tries different ways to access the collection_query data structure to handle
 * various Notion API response formats.
 * 
 * @param {Object} recordMap - The Notion recordMap from notion.getPage()
 * @param {string} uuid - The normalized UUID of the parent collection
 * @returns {string[]} Array of page IDs found in the collection
 */
export function extractPageIdsFromRecordMap(recordMap, uuid) {
  const collectionQuery = recordMap?.collection_query;
  const block = recordMap?.block;
  const pageIdsSet = new Set();

  if (collectionQuery) {
    // Strategy 1: Try collection_group_results (standard approach)
    const views = Object.values(collectionQuery)[0];
    if (views) {
      Object.values(views).forEach((view) => {
        view?.collection_group_results?.blockIds?.forEach((id) => {
          pageIdsSet.add(id);
        });
      });
    }

    // Strategy 2: If no IDs found, try direct blockIds access
    if (pageIdsSet.size === 0) {
      Object.values(collectionQuery).forEach((queryResult) => {
        if (queryResult?.blockIds) {
          queryResult.blockIds.forEach((id) => {
            pageIdsSet.add(id);
          });
        }
      });
    }

    // Strategy 3: Try accessing through results property
    if (pageIdsSet.size === 0) {
      Object.values(collectionQuery).forEach((queryResult) => {
        Object.values(queryResult || {}).forEach((view) => {
          view?.results?.blockIds?.forEach((id) => {
            pageIdsSet.add(id);
          });
        });
      });
    }
  }

  // Strategy 4: Fallback to block entries if no collection_query data
  if (pageIdsSet.size === 0 && block && uuid) {
    Object.keys(block).forEach((id) => {
      const pageBlock = block[id]?.value;
      // Check if it's a page (not a collection itself)
      if (pageBlock && pageBlock.type === 'page') {
        // Normalize both IDs to compare in the same format
        const parentId = pageBlock.parent_id;
        const normalizedParentId = parentId ? idToUuid(parentId) : null;
        if (normalizedParentId === uuid) {
          pageIdsSet.add(id);
        }
      }
    });
  }

  return Array.from(pageIdsSet);
}
