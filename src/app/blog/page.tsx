import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/article-card";
import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";
import { getPaginatedArticles } from "@/lib/content/service";

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const ARTICLES_PER_PAGE = 8;

function parsePage(rawPage: string | undefined): number {
  if (!rawPage) {
    return 1;
  }

  const parsed = Number.parseInt(rawPage, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);

  const title = page > 1 ? `Blog - Page ${page}` : "Blog";
  const description =
    "Browse the latest technical articles on architecture, frontend, and platform engineering.";
  const canonical = page > 1 ? `/blog?page=${page}` : "/blog";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const revalidate = 1800;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);

  const {
    articles,
    currentPage,
    hasNextPage,
    hasPreviousPage,
  } = await getPaginatedArticles(page, ARTICLES_PER_PAGE);

  const previousPageHref =
    currentPage <= 2 ? "/blog" : `/blog?page=${currentPage - 1}`;
  const nextPageHref = `/blog?page=${currentPage + 1}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 md:px-8">
      <header className="space-y-3">
        <BlockingNavigationLink
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.1em] text-ink-muted"
          loadingText="Loading homepage..."
        >
          Back to home
        </BlockingNavigationLink>
        <h1 className="font-serif text-5xl text-ink">Blog</h1>
        <p className="max-w-3xl text-lg text-ink-muted">
          Latest technical writing on architecture, frontend, and platform
          engineering.
        </p>
      </header>

      {articles.length === 0 ? (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 text-ink-muted">
          <p>
            {currentPage > 1
              ? "No posts on this page."
              : "No posts found yet. Publish your first post in WordPress."}
          </p>
          {currentPage > 1 ? (
            <BlockingNavigationLink
              href="/blog"
              className="inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
              loadingText="Loading blog page..."
            >
              Go back to page 1
            </BlockingNavigationLink>
          ) : null}
        </section>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              articleHrefBasePath="/blog"
            />
          ))}
        </div>
      )}

      {hasPreviousPage || hasNextPage ? (
        <nav
          className="flex items-center justify-between border-t border-border pt-6"
          aria-label="Blog pagination"
        >
          {hasPreviousPage ? (
            <BlockingNavigationLink
              href={previousPageHref}
              className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              loadingText="Loading previous page..."
            >
              Previous
            </BlockingNavigationLink>
          ) : (
            <span className="text-sm text-ink-muted">&nbsp;</span>
          )}

          <p className="text-sm font-medium text-ink-muted">Page {currentPage}</p>

          {hasNextPage ? (
            <BlockingNavigationLink
              href={nextPageHref}
              className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              loadingText="Loading next page..."
            >
              Next
            </BlockingNavigationLink>
          ) : (
            <span className="text-sm text-ink-muted">&nbsp;</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
