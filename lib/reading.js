const LITERAL_GRAPHQL = "https://api.literal.club/graphql";
const HANDLE = "kvaishak";

async function literalGraphql(query, variables = {}) {
  const response = await fetch(LITERAL_GRAPHQL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) return null;
  const json = await response.json();
  return json.data ?? null;
}

export async function fetchCurrentlyReading() {
  try {
    const profileData = await literalGraphql(
      `
      query getProfileParts($handle: String!) {
        profile(where: { handle: $handle }) {
          id
        }
      }
      `,
      { handle: HANDLE }
    );
    const profileId = profileData?.profile?.id;
    if (!profileId) return [];

    const booksData = await literalGraphql(
      `
      query booksByReadingStateAndProfile(
        $limit: Int!
        $offset: Int!
        $readingStatus: ReadingStatus!
        $profileId: String!
      ) {
        booksByReadingStateAndProfile(
          limit: $limit
          offset: $offset
          readingStatus: $readingStatus
          profileId: $profileId
        ) {
          id
          slug
          title
          subtitle
          description
          isbn10
          isbn13
          language
          pageCount
          publishedDate
          publisher
          cover
          authors {
            id
            name
            slug
          }
          gradientColors
        }
      }
      `,
      {
        profileId,
        readingStatus: "IS_READING",
        limit: 20,
        offset: 0,
      }
    );

    const books = booksData?.booksByReadingStateAndProfile || [];
    return books;
  } catch {
    return [];
  }
}
