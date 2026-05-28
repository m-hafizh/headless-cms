import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import { ConfigBanner } from "@/components/articles/config-banner";
import {
  getHomepageArticles,
  isWordPressConfigured,
} from "@/lib/content/service";

export const revalidate = 1800;

export default async function HomePage() {
  const articles = await getHomepageArticles(9);
  const [featuredArticle, ...latestArticles] = articles;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 md:gap-12 md:px-8">
      <section className="grid gap-7 rounded-3xl border border-border bg-surface px-6 py-8 shadow-[var(--card-shadow)] md:grid-cols-[1.25fr_1fr] md:px-8 md:py-10">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            IT Articles and Deep Dives
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            Technical writing with a clean editorial reading experience.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink-muted">
            WordPress handles publishing workflow. Next.js handles performance,
            discoverability, and UX.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ color: "var(--accent-foreground)" }}
            >
              Search Articles
            </Link>
            <Link
              href="/categories/architecture"
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Browse Architecture
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Headless stack
          </p>
          <ul className="mt-5 space-y-3 text-sm text-ink-muted">
            <li>WPGraphQL for content delivery</li>
            <li>ISR + webhook revalidation for freshness</li>
            <li>Algolia for instant search relevance</li>
            <li>Dark mode and accessible focus states</li>
          </ul>
        </div>
      </section>

      <ConfigBanner isWordPressConnected={isWordPressConfigured()} />

      {featuredArticle ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Featured article
          </h2>
          <ArticleCard article={featuredArticle} featured />
        </section>
      ) : null}

      <section className="space-y-5">
        <h2 className="font-serif text-4xl text-ink">Latest reads</h2>

        {latestArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border bg-surface p-6 text-ink-muted">
            No articles found yet. Publish your first WordPress post and it will
            appear here.
          </p>
        )}
      </section>
    </div>
  );
}
