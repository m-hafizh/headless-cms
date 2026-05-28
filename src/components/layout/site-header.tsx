import Link from "next/link";
import { Search } from "lucide-react";

import type { Category } from "@/types/content";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type SiteHeaderProps = {
  categories: Category[];
};

export function SiteHeader({ categories }: SiteHeaderProps) {
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

        <nav className="hidden min-w-0 flex-1 items-center gap-3 overflow-x-auto md:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold tracking-[0.08em] text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/studio/posts"
            className="inline-flex h-10 items-center rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            Studio
          </Link>
          <Link
            href="/search"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
