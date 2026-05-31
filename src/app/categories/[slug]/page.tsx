import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/article-card";
import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";
import { getArticlesByCategory } from "@/lib/content/service";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 1800;

function toTitleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticlesByCategory(slug, 1);

  const categoryTitle = articles[0]?.category.name ?? toTitleCaseFromSlug(slug);
  const categoryDescription =
    articles[0]?.category.description ??
    `Technical articles curated for ${categoryTitle}.`;

  return {
    title: `${categoryTitle} Articles`,
    description: categoryDescription,
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${categoryTitle} Articles`,
      description: categoryDescription,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const articles = await getArticlesByCategory(slug);

  const categoryTitle = articles[0]?.category.name ?? toTitleCaseFromSlug(slug);
  const categoryDescription =
    articles[0]?.category.description ?? "Technical articles curated for this topic.";

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
        <h1 className="font-serif text-5xl text-ink">{categoryTitle}</h1>
        <p className="max-w-2xl text-lg text-ink-muted">
          {categoryDescription}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-ink-muted">
          No posts are published in this category yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
