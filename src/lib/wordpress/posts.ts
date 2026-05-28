import { stripHtml, trimText } from "@/lib/utils/text";
import type { ManagedPost, PostStatus, PostWriteInput } from "@/types/content";

const DEFAULT_LIST_LIMIT = 20;
const SUPPORTED_STATUSES = ["draft", "publish", "pending", "private"] as const;

type WordPressRenderedField = {
  rendered?: string;
  raw?: string;
};

type WordPressPostNode = {
  id: number;
  slug?: string;
  status?: string;
  date?: string;
  modified?: string;
  link?: string;
  title?: WordPressRenderedField;
  excerpt?: WordPressRenderedField;
  content?: WordPressRenderedField;
};

export class WordPressApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "WordPressApiError";
    this.status = status;
    this.details = details;
  }
}

function isTruthyString(value: string | undefined): value is string {
  return Boolean(value && value.trim());
}

function sanitizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeStatus(value: string | undefined): PostStatus {
  if (value && SUPPORTED_STATUSES.includes(value as PostStatus)) {
    return value as PostStatus;
  }

  return "draft";
}

function fallbackGraphQlToRestUrl(graphqlUrl: string): string | null {
  try {
    const parsed = new URL(graphqlUrl);
    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    const basePath = normalizedPath.endsWith("/graphql")
      ? normalizedPath.slice(0, -"/graphql".length)
      : normalizedPath;

    parsed.pathname = `${basePath}/wp-json/wp/v2`;
    parsed.search = "";
    parsed.hash = "";

    return sanitizeBaseUrl(parsed.toString());
  } catch {
    return null;
  }
}

export function getWordPressRestBaseUrl(): string | null {
  const configuredRestUrl = process.env.WORDPRESS_REST_URL;
  if (isTruthyString(configuredRestUrl)) {
    return sanitizeBaseUrl(configuredRestUrl.trim());
  }

  const graphqlUrl = process.env.WORDPRESS_GRAPHQL_URL;
  if (!isTruthyString(graphqlUrl)) {
    return null;
  }

  return fallbackGraphQlToRestUrl(graphqlUrl.trim());
}

export function isWordPressPostCrudConfigured(): boolean {
  return Boolean(
    getWordPressRestBaseUrl() &&
      isTruthyString(process.env.WORDPRESS_ADMIN_USERNAME) &&
      isTruthyString(process.env.WORDPRESS_APPLICATION_PASSWORD),
  );
}

function getWordPressBasicAuthHeader(): string {
  const username = process.env.WORDPRESS_ADMIN_USERNAME;
  const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD;

  if (!isTruthyString(username) || !isTruthyString(applicationPassword)) {
    throw new WordPressApiError(
      "WordPress write credentials are missing. Set WORDPRESS_ADMIN_USERNAME and WORDPRESS_APPLICATION_PASSWORD.",
      500,
      null,
    );
  }

  const token = Buffer.from(`${username}:${applicationPassword}`).toString("base64");
  return `Basic ${token}`;
}

function mapPost(node: WordPressPostNode): ManagedPost {
  const title = node.title?.raw?.trim() || stripHtml(node.title?.rendered ?? "Untitled");
  const excerptRaw = node.excerpt?.raw?.trim();
  const excerptRendered = stripHtml(node.excerpt?.rendered ?? "");
  const content = node.content?.raw ?? node.content?.rendered ?? "";

  return {
    id: node.id,
    slug: node.slug?.trim() || `post-${node.id}`,
    status: normalizeStatus(node.status),
    title,
    excerpt: excerptRaw || trimText(excerptRendered, 220),
    content,
    link: node.link?.trim() || "",
    publishedAt: node.date || new Date().toISOString(),
    updatedAt: node.modified || node.date || new Date().toISOString(),
  };
}

async function requestWordPress<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getWordPressRestBaseUrl();

  if (!baseUrl) {
    throw new WordPressApiError(
      "WordPress REST URL is not configured. Set WORDPRESS_REST_URL or WORDPRESS_GRAPHQL_URL.",
      500,
      null,
    );
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: getWordPressBasicAuthHeader(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const rawText = await response.text();
  let parsedBody: unknown = null;

  if (rawText) {
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      parsedBody = rawText;
    }
  }

  if (!response.ok) {
    const message =
      typeof parsedBody === "object" &&
      parsedBody !== null &&
      "message" in parsedBody &&
      typeof (parsedBody as { message?: unknown }).message === "string"
        ? ((parsedBody as { message: string }).message ?? "WordPress API request failed")
        : "WordPress API request failed";

    throw new WordPressApiError(message, response.status, parsedBody);
  }

  return parsedBody as T;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listManagedPosts(options?: {
  page?: number;
  perPage?: number;
  status?: PostStatus | "all";
}): Promise<ManagedPost[]> {
  const page = Math.max(1, options?.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options?.perPage ?? DEFAULT_LIST_LIMIT));
  const status = options?.status;

  const query = toQuery({
    context: "edit",
    orderby: "date",
    order: "desc",
    page,
    per_page: perPage,
    status: status && status !== "all" ? status : undefined,
  });

  const posts = await requestWordPress<WordPressPostNode[]>(`/posts${query}`);
  return posts.map(mapPost);
}

export async function getManagedPostById(id: number): Promise<ManagedPost> {
  const post = await requestWordPress<WordPressPostNode>(
    `/posts/${id}${toQuery({ context: "edit" })}`,
  );
  return mapPost(post);
}

function sanitizeWriteInput(input: PostWriteInput): Record<string, string> {
  const payload: Record<string, string> = {
    title: input.title,
    content: input.content,
    status: input.status ?? "draft",
  };

  if (isTruthyString(input.slug)) {
    payload.slug = input.slug.trim();
  }

  if (typeof input.excerpt === "string") {
    payload.excerpt = input.excerpt;
  }

  return payload;
}

export async function createManagedPost(input: PostWriteInput): Promise<ManagedPost> {
  const payload = sanitizeWriteInput(input);
  const created = await requestWordPress<WordPressPostNode>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapPost(created);
}

export async function updateManagedPost(
  id: number,
  input: Partial<PostWriteInput>,
): Promise<ManagedPost> {
  const payload = sanitizeWriteInput({
    title: input.title ?? "",
    content: input.content ?? "",
    excerpt: input.excerpt,
    slug: input.slug,
    status: input.status,
  });

  if (!input.title) {
    delete payload.title;
  }

  if (!input.content) {
    delete payload.content;
  }

  if (!input.status) {
    delete payload.status;
  }

  const updated = await requestWordPress<WordPressPostNode>(`/posts/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapPost(updated);
}

export async function deleteManagedPost(id: number): Promise<void> {
  await requestWordPress<unknown>(`/posts/${id}${toQuery({ force: "true" })}`, {
    method: "DELETE",
  });
}
