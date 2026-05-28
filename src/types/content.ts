export type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type SeoFields = {
  title: string;
  description: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  category: Category;
  tags: string[];
  author: Author;
  seo: SeoFields;
  isFeatured: boolean;
};

export type ArticleSearchHit = {
  objectID: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryName?: string;
  authorName?: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
};

export type PostStatus = "draft" | "publish" | "pending" | "private";

export type ManagedPost = {
  id: number;
  slug: string;
  status: PostStatus;
  title: string;
  excerpt: string;
  content: string;
  link: string;
  publishedAt: string;
  updatedAt: string;
};

export type PostWriteInput = {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  status?: PostStatus;
};
