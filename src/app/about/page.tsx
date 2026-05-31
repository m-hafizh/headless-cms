import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Kernel Notes combines WordPress publishing with a fast Next.js reading experience.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 md:px-8">
      <header className="space-y-4 rounded-3xl border border-border bg-surface px-6 py-8 shadow-(--card-shadow) md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
          About Kernel Notes
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
          A reader-first technical publication powered by WordPress and Next.js.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-ink-muted">
          We use WordPress as the editorial backend and Next.js as the delivery
          layer, so writers can publish quickly while readers get a clean,
          performant experience.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-surface p-6 shadow-(--card-shadow)">
          <h2 className="font-serif text-2xl text-ink">Editorial approach</h2>
          <p className="mt-3 leading-7 text-ink-muted">
            Articles are written and managed in WordPress admin. After publish,
            our Next.js frontend refreshes content with revalidation and keeps
            routes optimized for reading, discovery, and search.
          </p>
        </article>

        <article className="rounded-3xl border border-border bg-surface p-6 shadow-(--card-shadow)">
          <h2 className="font-serif text-2xl text-ink">Technology stack</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-ink-muted">
            <li>WordPress + WPGraphQL for structured content.</li>
            <li>WordPress REST API for editorial operations.</li>
            <li>Next.js App Router for fast server rendering and SEO.</li>
            <li>Algolia search for fast content discovery.</li>
          </ul>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-(--card-shadow)">
        <h2 className="font-serif text-2xl text-ink">Work with us</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-muted">
          We are open to collaborations on frontend architecture, platform
          engineering, and developer experience topics.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Explore articles
          </Link>
          <Link
            href="/categories"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Browse topics
          </Link>
        </div>
      </section>
    </div>
  );
}