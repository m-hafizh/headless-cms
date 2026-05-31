"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { liteClient as algoliasearch } from "algoliasearch/lite";

import { algoliaConfig } from "@/lib/algolia";
import type { ArticleSearchHit } from "@/types/content";
import { stripHtml, trimText } from "@/lib/utils/text";

const siteSearchConfig = {
  applicationId: algoliaConfig.appId || "TPXNSV5U7E",
  apiKey: algoliaConfig.searchKey || "70d90ff81d7a2d66273901eca6b5a139",
  indexName: algoliaConfig.indexName || "wp_searchable_posts",
  attributes: {
    primaryText: "post_title",
    secondaryText: "content",
    tertiaryText: undefined,
    url: "",
    image: "",
  },
  darkMode: true,
};

function getArticleSlug(hit: ArticleSearchHit): string | null {
  if (typeof hit.slug === "string" && hit.slug.trim()) {
    return hit.slug.trim();
  }

  if (typeof hit.permalink !== "string" || !hit.permalink.trim()) {
    return null;
  }

  try {
    const parsedUrl = new URL(hit.permalink);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return null;
    }

    const slug = segments[segments.length - 1];
    return slug === "index.php" ? null : slug;
  } catch {
    const path = hit.permalink.split("?")[0] ?? "";
    const segments = path.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  }
}

function getArticleHref(hit: ArticleSearchHit): string {
  const slug = getArticleSlug(hit);
  return slug ? `/articles/${encodeURIComponent(slug)}` : "#";
}

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ArticleSearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const client = useMemo(() => {
    return algoliasearch(siteSearchConfig.applicationId, siteSearchConfig.apiKey);
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
              indexName: siteSearchConfig.indexName,
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
  const showError = hasError && trimmedQuery.length >= 2;
  const showNoResults = !isLoading && !hasError && trimmedQuery.length >= 2 && hits.length === 0;

  return (
    <div id="search" className="space-y-8">
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

      {showError ? (
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
            href={getArticleHref(hit)}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <p className="font-serif text-2xl leading-tight text-ink">
              {String(hit[siteSearchConfig.attributes.primaryText] ?? "Untitled")}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {trimText(
                stripHtml(
                  String(hit[siteSearchConfig.attributes.secondaryText] ?? ""),
                ),
                200,
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {hit.taxonomies?.category?.[0] ? (
                <span>{hit.taxonomies.category[0]}</span>
              ) : null}
              {hit.post_date_formatted ? <span>{hit.post_date_formatted}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
