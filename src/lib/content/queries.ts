export const HOME_FEED_QUERY = `
  query HomeFeed($first: Int!) {
    posts(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        content
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            id
            name
            slug
            description
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            id
            slug
            name
            description
            avatar {
              url
            }
          }
        }
      }
    }
  }
`;

export const PAGINATED_POSTS_QUERY = `
  query PaginatedPosts($first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        content
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            id
            name
            slug
            description
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            id
            slug
            name
            description
            avatar {
              url
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const POST_BY_SLUG_QUERY = `
  query PostBySlug($slug: ID!, $asPreview: Boolean = false) {
    post(id: $slug, idType: SLUG, asPreview: $asPreview) {
      id
      slug
      title
      excerpt
      content
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          id
          name
          slug
          description
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          id
          slug
          name
          description
          avatar {
            url
          }
        }
      }
    }
  }
`;

export const POSTS_BY_CATEGORY_QUERY = `
  query PostsByCategory($category: String!, $first: Int!) {
    posts(
      first: $first
      where: {
        categoryName: $category
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        content
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            id
            name
            slug
            description
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            id
            slug
            name
            description
            avatar {
              url
            }
          }
        }
      }
    }
  }
`;

export const POSTS_BY_AUTHOR_QUERY = `
  query PostsByAuthor($author: String!, $first: Int!) {
    posts(
      first: $first
      where: {
        authorName: $author
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        content
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            id
            name
            slug
            description
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            id
            slug
            name
            description
            avatar {
              url
            }
          }
        }
      }
    }
  }
`;

export const CATEGORY_LIST_QUERY = `
  query CategoryList($first: Int!) {
    categories(first: $first, where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
        description
      }
    }
  }
`;
