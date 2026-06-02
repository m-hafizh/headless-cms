import Link from "next/link";
import { Search } from "lucide-react";

import type { Category } from "@/types/content";
import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";
import { TopicsMenu } from "@/components/layout/topics-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isStudioEnabled } from "@/lib/feature-flags";

type SiteHeaderProps = {
  categories: Category[];
};

export function SiteHeader({ categories }: SiteHeaderProps) {
  const studioEnabled = isStudioEnabled();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-elevated/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-4 md:px-8">
        <Link href="/" className="shrink-0">
          <p className="font-sans text-xs tracking-[0.24em] text-ink-muted">
            WORDPRESS + NEXTJS
          </p>
          <p className="font-serif text-xl leading-tight text-ink">
            Kernel Notes
          </p>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center md:flex">
          <TopicsMenu categories={categories} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="md:hidden">
            <TopicsMenu categories={categories} />
          </div>
          <BlockingNavigationLink
            href="/about"
            className="inline-flex h-10 items-center rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            loadingText="Loading about page..."
          >
            About
          </BlockingNavigationLink>
          <BlockingNavigationLink
            href="/blog"
            className="inline-flex h-10 items-center rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            loadingText="Loading blog page..."
          >
            Blog
          </BlockingNavigationLink>
          {studioEnabled ? (
            <BlockingNavigationLink
              href="/studio/posts"
              className="inline-flex h-10 items-center rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
              loadingText="Loading studio..."
            >
              Studio
            </BlockingNavigationLink>
          ) : null}
          <BlockingNavigationLink
            href="/search"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            loadingText="Loading search..."
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </BlockingNavigationLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
