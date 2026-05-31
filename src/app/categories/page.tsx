import type { Metadata } from "next";

import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";
import { getTopCategories } from "@/lib/content/service";

export const metadata: Metadata = {
  title: "All Topics",
  description: "Browse all publication topics.",
};

export const revalidate = 1800;

export default async function CategoriesIndexPage() {
  const categories = await getTopCategories(100);

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
        <h1 className="font-serif text-5xl text-ink">All topics</h1>
        <p className="max-w-2xl text-lg text-ink-muted">
          Browse every category used across the publication.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-ink-muted">
          No topics are available yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <BlockingNavigationLink
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-ink transition-colors hover:border-accent hover:text-accent"
              loadingText="Loading category posts..."
            >
              <p className="font-semibold">{category.name}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {category.description ?? "Read articles in this topic."}
              </p>
            </BlockingNavigationLink>
          ))}
        </div>
      )}
    </div>
  );
}
