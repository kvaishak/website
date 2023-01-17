export async function fetchCurrentlyReading() {
  const variables = {
    handle: "kvaishak",
    readingStatus: "IS_READING",
    layout: "list",
    limit: 20,
  };

  const response = await fetch("https://backend.literal.club/", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
                  query booksByReadingStateAndHandle($limit: Int!, $offset: Int!, $readingStatus: ReadingStatus!, $handle: String!) {
                      booksByReadingStateAndHandle(
                          limit: $limit
                          offset: $offset
                          readingStatus: $readingStatus
                          handle: $handle
                      ) {
                          ...BookParts
                          __typename
                      }
                  }
                  
                  fragment BookParts on Book {
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
                      physicalFormat
                      cover
                      authors {
                          ...AuthorMini
                          __typename
                      }
                      gradientColors
                      workId
                      __typename
                  }
                  
                  fragment AuthorMini on Author {
                      id
                      name
                      slug
                      __typename
                  }
              `,
      variables: {
        handle: variables.handle,
        readingStatus: variables.readingStatus,
        limit: variables.limit,
        offset: 0,
      },
    }),
  });

  const result = await response.json();
  const books = result.data.booksByReadingStateAndHandle || [];

  return books;
}
