"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import type { Category } from "@/types/content";

type TopicsMenuProps = {
  categories: Category[];
};

type TopicGroupDefinition = {
  title: string;
  matchers: string[];
};

type TopicGroup = {
  title: string;
  categories: Category[];
};

const TOPIC_GROUP_DEFINITIONS: TopicGroupDefinition[] = [
  {
    title: "Engineering",
    matchers: [
      "architecture",
      "engineering",
      "frontend",
      "backend",
      "api",
      "database",
      "security",
      "cloud",
      "infra",
      "devops",
      "platform",
      "technology",
      "tech",
      "ai",
      "ml",
      "data",
    ],
  },
  {
    title: "Product & Design",
    matchers: [
      "product",
      "design",
      "ux",
      "ui",
      "research",
      "content",
      "growth",
      "brand",
      "marketing",
    ],
  },
  {
    title: "Guides",
    matchers: ["guide", "tutorial", "how-to", "tips", "learn", "walkthrough"],
  },
];

const FALLBACK_GROUP_TITLE = "More topics";

function buildTopicGroups(categories: Category[]): TopicGroup[] {
  const groups = TOPIC_GROUP_DEFINITIONS.map((definition) => ({
    title: definition.title,
    categories: [] as Category[],
  }));
  const fallbackCategories: Category[] = [];

  const sortedCategories = [...categories].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  for (const category of sortedCategories) {
    const searchable = `${category.slug} ${category.name}`.toLowerCase();
    const matchedIndex = TOPIC_GROUP_DEFINITIONS.findIndex((definition) =>
      definition.matchers.some((matcher) => searchable.includes(matcher)),
    );

    if (matchedIndex === -1) {
      fallbackCategories.push(category);
      continue;
    }

    groups[matchedIndex].categories.push(category);
  }

  const activeGroups = groups.filter((group) => group.categories.length > 0);

  if (fallbackCategories.length > 0) {
    activeGroups.push({
      title: FALLBACK_GROUP_TITLE,
      categories: fallbackCategories,
    });
  }

  return activeGroups;
}

type TopicGroupListProps = {
  groups: TopicGroup[];
  linkClassName: string;
  onNavigate: (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
    loadingText: string,
  ) => void;
};

function isModifiedClick(event: ReactMouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function TopicGroupList({
  groups,
  linkClassName,
  onNavigate,
}: TopicGroupListProps) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {group.title}
          </p>
          <div className="grid gap-2">
            {group.categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={linkClassName}
                onClick={(event) =>
                  onNavigate(
                    event,
                    `/categories/${category.slug}`,
                    "Loading category posts...",
                  )
                }
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopicsMenu({ categories }: TopicsMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading page...");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const topicGroups = buildTopicGroups(categories);

  function closeMenu() {
    setIsOpen(false);
  }

  function handleNavigation(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
    nextLoadingText: string,
  ) {
    if (isModifiedClick(event) || isPending) {
      return;
    }

    event.preventDefault();
    setLoadingText(nextLoadingText);
    closeMenu();

    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Toggle topics menu"
      >
        Topics
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
          <div className="hidden md:block absolute left-0 top-12 z-50 w-[320px] rounded-2xl border border-border bg-surface p-4 shadow-(--card-shadow)">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Browse topics
            </p>
            {topicGroups.length > 0 ? (
              <div className="max-h-72 overflow-y-auto pr-1">
                <TopicGroupList
                  groups={topicGroups}
                  linkClassName="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                  onNavigate={handleNavigation}
                />
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No topics available yet.</p>
            )}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <Link
              href="/categories"
              className="inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
              onClick={(event) =>
                handleNavigation(event, "/categories", "Loading all topics...")
              }
            >
              View all topics
            </Link>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={closeMenu}
            aria-label="Close topics menu"
          />

          <div className="absolute right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col border-l border-border bg-bg-elevated p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Topics
              </p>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-accent hover:text-accent"
                onClick={closeMenu}
                aria-label="Close topics panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto pb-4 pr-1">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Browse topics
                </p>
                {topicGroups.length > 0 ? (
                  <TopicGroupList
                    groups={topicGroups}
                    linkClassName="rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                    onNavigate={handleNavigation}
                  />
                ) : (
                  <p className="text-sm text-ink-muted">No topics available yet.</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <Link
                  href="/categories"
                  className="inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
                  onClick={(event) =>
                    handleNavigation(event, "/categories", "Loading all topics...")
                  }
                >
                  View all topics
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isPending ? (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/45 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label={loadingText}
        >
          <div className="rounded-2xl border border-white/20 bg-black/40 px-5 py-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <p className="text-sm font-semibold">{loadingText}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}