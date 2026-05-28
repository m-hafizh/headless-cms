"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Search } from "lucide-react";
import { liteClient as algoliasearch } from "algoliasearch/lite";

import { algoliaConfig } from "@/lib/algolia";
import type { ArticleSearchHit } from "@/types/content";
import { formatArticleDate } from "@/lib/utils/text";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ArticleSearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const client = useMemo(() => {
    return algoliasearch(algoliaConfig.appId, algoliaConfig.searchKey);
  }, []);

  const trimmedQuery = query.trim();

  useEffect(() => {
    let cancelled = false;

    if (trimmedQuery.length < 2) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await client.search<ArticleSearchHit>({
          requests: [
            {
              indexName: algoliaConfig.indexName,
              query: trimmedQuery,
              hitsPerPage: 8,
            },
          ],
        });

        const firstResult = response.results[0] as
          | { hits?: ArticleSearchHit[] }
          | undefined;

        if (!cancelled) {
          setHits(firstResult?.hits ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Algolia search request failed", error);
          setHasError(true);
          setHits([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [client, trimmedQuery]);

  const visibleHits = trimmedQuery.length < 2 ? [] : hits;
  const showNoResults = !isLoading && !hasError && trimmedQuery.length >= 2 && hits.length === 0;

  return (
    <div className="space-y-8">
      <label className="relative block">
        <span className="sr-only">Search articles</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, framework, architecture pattern..."
          className="w-full rounded-2xl border border-border bg-surface py-4 pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
        />
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 text-ink-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <p>Searching Algolia...</p>
        </div>
      ) : null}

      {hasError ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-muted">
          Search failed. Verify your Algolia app id, search key, and index name.
        </p>
      ) : null}

      {showNoResults ? (
        <p className="text-sm text-ink-muted">
          No results yet. Try broader terms like graphql, revalidation, caching,
          or design-system.
        </p>
      ) : null}

      <div className="grid gap-4">
        {visibleHits.map((hit) => (
          <Link
            key={hit.objectID}
            href={`/articles/${hit.slug}`}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <p className="font-serif text-2xl leading-tight text-ink">
              {hit.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {hit.excerpt}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {hit.categoryName ? <span>{hit.categoryName}</span> : null}
              {hit.authorName ? <span>{hit.authorName}</span> : null}
              {hit.publishedAt ? <span>{formatArticleDate(hit.publishedAt)}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
