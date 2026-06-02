import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import { ArticleMeta } from "@/components/articles/article-meta";
import { ArticleRichContent } from "@/components/articles/article-rich-content";
import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";
import {
  getArticleBySlug,
  getRelatedArticles,
  isWordPressConfigured,
} from "@/lib/content/service";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 1800;

function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    return "http://localhost:3000";
  }

  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const draft = await draftMode();
  const { slug } = await params;
  const article = await getArticleBySlug(slug, {
    preview: draft.isEnabled,
  });

  if (!article) {
    return {
      title: "Article not found",
      description: "The requested article could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalPath = `/blog/${slug}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const openGraphImages = article.coverImageUrl
    ? [
        {
          url: article.coverImageUrl,
          alt: article.coverImageAlt,
        },
      ]
    : undefined;
  const twitterImages = article.coverImageUrl ? [article.coverImageUrl] : undefined;

  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      type: "article",
      url: canonicalUrl,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
      images: openGraphImages,
    },
    twitter: {
      card: article.coverImageUrl ? "summary_large_image" : "summary",
      title: article.seo.title,
      description: article.seo.description,
      images: twitterImages,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const draft = await draftMode();
  const { slug } = await params;
  const article = await getArticleBySlug(slug, {
    preview: draft.isEnabled,
  });

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article, 3);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 md:px-8">
      {draft.isEnabled ? (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
          Preview mode is enabled.
          <Link
            href="/api/preview/exit"
            className="ml-2 font-semibold text-accent underline-offset-4 hover:underline"
          >
            Exit preview
          </Link>
        </p>
      ) : null}

      {!isWordPressConfigured() ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-ink-muted">
          You are viewing sample content. Connect WORDPRESS_GRAPHQL_URL for live
          content.
        </p>
      ) : null}

      <article className="mx-auto w-full max-w-3xl space-y-7">
        <BlockingNavigationLink
          href={`/categories/${article.category.slug}`}
          className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink-muted transition-colors hover:border-accent hover:text-accent"
          loadingText="Loading category posts..."
        >
          {article.category.name}
        </BlockingNavigationLink>

        <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
          {article.title}
        </h1>

        <ArticleMeta article={article} />

        {article.coverImageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-border bg-surface-contrast">
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt}
              fill
              sizes="(min-width: 1024px) 768px, (min-width: 768px) 90vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <ArticleRichContent
          contentHtml={
            article.contentHtml || "<p>Content for this post has not been added.</p>"
          }
        />
      </article>

      <section className="mx-auto w-full max-w-3xl space-y-5">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6">
          <p className="font-serif text-2xl text-ink">{article.author.name}</p>
          <p className="mt-2 text-ink-muted">{article.author.bio}</p>
          <BlockingNavigationLink
            href={`/authors/${article.author.slug}`}
            className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
            loadingText="Loading author posts..."
          >
            View all posts by {article.author.name}
          </BlockingNavigationLink>
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-serif text-3xl text-ink">
            Related reads
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedArticles.map((related) => (
              <ArticleCard key={related.id} article={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
