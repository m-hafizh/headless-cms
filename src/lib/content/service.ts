import { GraphQLClient } from "graphql-request";
import { cache } from "react";

import type { Article, Author, Category } from "@/types/content";
import {
  CATEGORY_LIST_QUERY,
  HOME_FEED_QUERY,
  PAGINATED_POSTS_QUERY,
  POST_BY_SLUG_QUERY,
  POSTS_BY_AUTHOR_QUERY,
  POSTS_BY_CATEGORY_QUERY,
} from "@/lib/content/queries";
import { sampleArticles, sampleCategories } from "@/lib/content/sample-data";
import {
  estimateReadingTimeFromHtml,
  stripHtml,
  trimText,
} from "@/lib/utils/text";

export const CONTENT_REVALIDATE_SECONDS = 1800;
export const CONTENT_CACHE_TAG = "wp-content";

type WPSeo = {
  title?: string | null;
  metaDesc?: string | null;
};

type WPAuthorNode = {
  id?: string | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  avatar?: {
    url?: string | null;
  } | null;
};

type WPTermNode = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
};

type WPPostNode = {
  id: string;
  slug: string;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  date?: string | null;
  modified?: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  categories?: {
    nodes?: WPTermNode[] | null;
  } | null;
  tags?: {
    nodes?: Array<{
      name?: string | null;
      slug?: string | null;
    }> | null;
  } | null;
  author?: {
    node?: WPAuthorNode | null;
  } | null;
  seo?: WPSeo | null;
};

type HomeFeedResponse = {
  posts: {
    nodes: WPPostNode[];
  };
};

type PaginatedPostsResponse = {
  posts: {
    nodes: WPPostNode[];
    pageInfo?: {
      hasNextPage?: boolean | null;
      endCursor?: string | null;
    } | null;
  };
};

type PostBySlugResponse = {
  post: WPPostNode | null;
};

type CategoryListResponse = {
  categories: {
    nodes: WPTermNode[];
  };
};

export type PaginatedArticleCollection = {
  articles: Article[];
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function isTruthyString(value: string | undefined): value is string {
  return Boolean(value && value.trim());
}

export function isWordPressConfigured(): boolean {
  return isTruthyString(process.env.WORDPRESS_GRAPHQL_URL);
}

const getWordPressClient = cache(() => {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;

  if (!isTruthyString(endpoint)) {
    return null;
  }

  return new GraphQLClient(endpoint, {
    fetch: (input, init) => {
      const enhancedInit = {
        ...(init ?? {}),
        next: {
          revalidate: CONTENT_REVALIDATE_SECONDS,
          tags: [CONTENT_CACHE_TAG],
        },
      };

      return fetch(input, enhancedInit as RequestInit);
    },
  });
});

async function requestWordPress<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const client = getWordPressClient();

  if (!client) {
    throw new Error("WORDPRESS_GRAPHQL_URL is not configured.");
  }

  return client.request<T>(query, variables);
}

function mapAuthor(node?: WPAuthorNode | null): Author {
  return {
    id: node?.id ?? "author-unknown",
    name: node?.name ?? "Unknown Author",
    slug: node?.slug ?? "unknown-author",
    bio: node?.description?.trim() || "No author bio available yet.",
    avatarUrl: node?.avatar?.url ?? null,
  };
}

function mapCategory(node?: WPTermNode | null): Category {
  return {
    id: node?.id ?? "category-uncategorized",
    name: node?.name ?? "Uncategorized",
    slug: node?.slug ?? "uncategorized",
    description: node?.description?.trim() || null,
  };
}

function mapPost(node: WPPostNode): Article {
  const title = stripHtml(node.title ?? "Untitled");
  const contentHtml = node.content ?? "";
  const excerptSource = node.excerpt ?? contentHtml;
  const excerpt = trimText(stripHtml(excerptSource), 180);

  return {
    id: node.id,
    slug: node.slug,
    title,
    excerpt,
    contentHtml,
    coverImageUrl: node.featuredImage?.node?.sourceUrl ?? null,
    coverImageAlt:
      node.featuredImage?.node?.altText?.trim() || `${title} cover image`,
    publishedAt: node.date ?? new Date().toISOString(),
    updatedAt: node.modified ?? node.date ?? new Date().toISOString(),
    readingTimeMinutes: estimateReadingTimeFromHtml(contentHtml),
    category: mapCategory(node.categories?.nodes?.[0]),
    tags:
      node.tags?.nodes
        ?.map((tag) => tag.name?.trim())
        .filter((tag): tag is string => Boolean(tag)) ?? [],
    author: mapAuthor(node.author?.node),
    seo: {
      title: node.seo?.title?.trim() || title,
      description: node.seo?.metaDesc?.trim() || trimText(excerpt, 155),
    },
    isFeatured: false,
  };
}

function withFeaturedFlag(articles: Article[]): Article[] {
  if (articles.length === 0) {
    return [];
  }

  return articles.map((article, index) => ({
    ...article,
    isFeatured: index === 0,
  }));
}

export async function getHomepageArticles(limit = 9): Promise<Article[]> {
  if (!isWordPressConfigured()) {
    return withFeaturedFlag(sampleArticles.slice(0, limit));
  }

  try {
    const response = await requestWordPress<HomeFeedResponse>(HOME_FEED_QUERY, {
      first: limit,
    });

    return withFeaturedFlag(response.posts.nodes.map(mapPost));
  } catch (error) {
    console.error("Falling back to local sample data for home feed", error);
    return withFeaturedFlag(sampleArticles.slice(0, limit));
  }
}

export async function getPaginatedArticles(
  page = 1,
  pageSize = 8,
): Promise<PaginatedArticleCollection> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(24, Math.max(1, pageSize));

  if (!isWordPressConfigured()) {
    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;

    return {
      articles: sampleArticles.slice(start, end),
      currentPage: safePage,
      hasNextPage: sampleArticles.length > end,
      hasPreviousPage: safePage > 1,
    };
  }

  try {
    let afterCursor: string | null = null;

    for (let currentPage = 1; currentPage <= safePage; currentPage += 1) {
      const pageResponse: PaginatedPostsResponse = await requestWordPress<PaginatedPostsResponse>(
        PAGINATED_POSTS_QUERY,
        {
          first: safePageSize,
          after: afterCursor,
        },
      );

      const nodes = pageResponse.posts.nodes.map(mapPost);
      const hasNextPage = Boolean(pageResponse.posts.pageInfo?.hasNextPage);
      const endCursor = pageResponse.posts.pageInfo?.endCursor ?? null;

      if (currentPage === safePage) {
        return {
          articles: nodes,
          currentPage: safePage,
          hasNextPage,
          hasPreviousPage: safePage > 1,
        };
      }

      if (!hasNextPage || !endCursor) {
        return {
          articles: [],
          currentPage: safePage,
          hasNextPage: false,
          hasPreviousPage: safePage > 1,
        };
      }

      afterCursor = endCursor;
    }

    return {
      articles: [],
      currentPage: safePage,
      hasNextPage: false,
      hasPreviousPage: safePage > 1,
    };
  } catch (error) {
    console.error("Falling back to local paginated posts", error);

    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;

    return {
      articles: sampleArticles.slice(start, end),
      currentPage: safePage,
      hasNextPage: sampleArticles.length > end,
      hasPreviousPage: safePage > 1,
    };
  }
}

export async function getArticleBySlug(
  slug: string,
  options?: {
    preview?: boolean;
  },
): Promise<Article | null> {
  if (!isWordPressConfigured()) {
    return sampleArticles.find((article) => article.slug === slug) ?? null;
  }

  try {
    const preview = Boolean(options?.preview);
    const response = await requestWordPress<PostBySlugResponse>(
      POST_BY_SLUG_QUERY,
      {
        slug,
        asPreview: preview,
      },
    );

    return response.post ? mapPost(response.post) : null;
  } catch (error) {
    console.error("Falling back to local sample post", error);
    return sampleArticles.find((article) => article.slug === slug) ?? null;
  }
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit = 24,
): Promise<Article[]> {
  if (!isWordPressConfigured()) {
    return sampleArticles.filter((article) => article.category.slug === categorySlug);
  }

  try {
    const response = await requestWordPress<HomeFeedResponse>(
      POSTS_BY_CATEGORY_QUERY,
      {
        category: categorySlug,
        first: limit,
      },
    );

    return response.posts.nodes.map(mapPost);
  } catch (error) {
    console.error("Falling back to local category collection", error);
    return sampleArticles.filter((article) => article.category.slug === categorySlug);
  }
}

export async function getArticlesByAuthor(
  authorSlug: string,
  limit = 24,
): Promise<Article[]> {
  if (!isWordPressConfigured()) {
    return sampleArticles.filter((article) => article.author.slug === authorSlug);
  }

  try {
    const response = await requestWordPress<HomeFeedResponse>(POSTS_BY_AUTHOR_QUERY, {
      author: authorSlug,
      first: limit,
    });

    return response.posts.nodes.map(mapPost);
  } catch (error) {
    console.error("Falling back to local author collection", error);
    return sampleArticles.filter((article) => article.author.slug === authorSlug);
  }
}

export async function getRelatedArticles(
  article: Article,
  limit = 3,
): Promise<Article[]> {
  const inCategory = await getArticlesByCategory(article.category.slug, limit + 4);
  return inCategory
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(0, limit);
}

export async function getTopCategories(limit = 6): Promise<Category[]> {
  if (!isWordPressConfigured()) {
    return sampleCategories.slice(0, limit);
  }

  try {
    const response = await requestWordPress<CategoryListResponse>(
      CATEGORY_LIST_QUERY,
      {
        first: limit,
      },
    );

    return response.categories.nodes.map(mapCategory);
  } catch (error) {
    console.error("Falling back to local categories", error);
    return sampleCategories.slice(0, limit);
  }
}
