import type { MetadataRoute } from "next";

import {
  getHomepageArticles,
  getTopCategories,
} from "@/lib/content/service";

function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    return "http://localhost:3000";
  }

  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, categories] = await Promise.all([
    getHomepageArticles(100),
    getTopCategories(24),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily",
    priority: article.isFeatured ? 0.9 : 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const authors = new Set(articles.map((article) => article.author.slug));
  const authorRoutes: MetadataRoute.Sitemap = Array.from(authors).map((slug) => ({
    url: `${siteUrl}/authors/${slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...authorRoutes];
}
