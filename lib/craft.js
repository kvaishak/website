/**
 * Fetches page content from Craft Docs API
 * @param {string} pageId - The Craft document ID (e.g., "818")
 * @returns {Promise<{content: string, title: string, error?: string}>}
 */
export async function fetchCraftPage(pageId) {
  try {
    const baseUrl = "https://connect.craft.do/links/6ohTiZBkGG3/api/v1";
    const response = await fetch(`${baseUrl}/blocks?id=${pageId}`, {
      method: "GET",
      headers: {
        Accept: "text/markdown",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawContent = await response.text();

    // Extract content from <content> tags
    const contentMatch = rawContent.match(/<content>([\s\S]*?)<\/content>/);
    let content = contentMatch ? contentMatch[1].trim() : rawContent;

    // Remove leading whitespace from each line to prevent code block interpretation
    content = content
      .split("\n")
      .map((line) => line.trimStart())
      .join("\n");

    // Extract title from <pageTitle> tags
    const titleMatch = rawContent.match(/<pageTitle>(.*?)<\/pageTitle>/);
    const title = titleMatch ? titleMatch[1] : "";

    return { content, title };
  } catch (error) {
    console.error("Error fetching Craft page:", error);
    return {
      content: "",
      title: "",
      error: error.message,
    };
  }
}
