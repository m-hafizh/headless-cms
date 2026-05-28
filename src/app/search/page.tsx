import { SearchPanel } from "@/components/search/search-panel";
import { isAlgoliaConfigured } from "@/lib/algolia";

export default function SearchPage() {
  const ready = isAlgoliaConfigured();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-5 md:px-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Algolia Search
        </p>
        <h1 className="font-serif text-5xl text-ink">
          Find your next deep dive
        </h1>
        <p className="max-w-2xl text-lg text-ink-muted">
          Search across article titles, excerpts, authors, and categories.
        </p>
      </header>

      {ready ? (
        <SearchPanel />
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-6 text-ink-muted">
          <p className="font-medium text-ink">Search is not configured yet.</p>
          <p className="mt-2">
            Set NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
            and NEXT_PUBLIC_ALGOLIA_INDEX_NAME in .env.local.
          </p>
        </section>
      )}
    </div>
  );
}
