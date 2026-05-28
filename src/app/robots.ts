import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    return "http://localhost:3000";
  }

  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/api/preview", "/api/revalidate"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
