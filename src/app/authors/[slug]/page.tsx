import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/article-card";
import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";
import { getArticlesByAuthor } from "@/lib/content/service";

type AuthorPageProps = {
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
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticlesByAuthor(slug, 1);

  const authorName = articles[0]?.author.name ?? toTitleCaseFromSlug(slug);
  const authorBio =
    articles[0]?.author.bio ?? `Technical articles written by ${authorName}.`;

  return {
    title: `${authorName} Articles`,
    description: authorBio,
    alternates: {
      canonical: `/authors/${slug}`,
    },
    openGraph: {
      title: `${authorName} Articles`,
      description: authorBio,
      type: "profile",
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const articles = await getArticlesByAuthor(slug);

  const author = articles[0]?.author;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 md:px-8">
      <header className="space-y-3 rounded-3xl border border-border bg-surface p-8">
        <BlockingNavigationLink
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.1em] text-ink-muted"
          loadingText="Loading homepage..."
        >
          Back to home
        </BlockingNavigationLink>
        <h1 className="font-serif text-5xl text-ink">
          {author?.name ?? "Author"}
        </h1>
        <p className="max-w-2xl text-lg text-ink-muted">
          {author?.bio ?? "Author profile is not available yet."}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-ink-muted">
          No published posts for this author yet.
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
