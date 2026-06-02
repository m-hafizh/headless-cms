import Image from "next/image";

import type { Article } from "@/types/content";
import { ArticleMeta } from "@/components/articles/article-meta";
import { BlockingNavigationLink } from "@/components/ui/blocking-navigation-link";

type ArticleCardProps = {
  article: Article;
  featured?: boolean;
  articleHrefBasePath?: string;
};

export function ArticleCard({
  article,
  featured = false,
  articleHrefBasePath = "/blog",
}: ArticleCardProps) {
  const articleHref = `${articleHrefBasePath}/${article.slug}`;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--card-shadow)] transition-colors hover:border-accent ${
        featured ? "md:grid md:grid-cols-2" : ""
      }`}
    >
      <div
        className={`relative ${
          featured ? "h-64 md:h-full" : "h-44"
        } overflow-hidden bg-surface-contrast`}
      >
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt}
            fill
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-end bg-surface-contrast p-6">
            <p className="max-w-[20ch] font-serif text-xl text-ink/85">
              {article.category.name}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-6">
        <BlockingNavigationLink
          href={articleHref}
          className="inline-flex w-fit rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-accent hover:text-accent"
          loadingText="Loading article..."
        >
          {article.category.name}
        </BlockingNavigationLink>

        <h2
          className={`font-serif leading-tight text-ink ${
            featured ? "text-3xl" : "text-2xl"
          }`}
        >
          <BlockingNavigationLink
            href={articleHref}
            className="decoration-accent/50 underline-offset-4 transition-colors hover:text-accent hover:underline"
            loadingText="Loading article..."
          >
            {article.title}
          </BlockingNavigationLink>
        </h2>

        <p className="text-base leading-7 text-ink-muted">
          {article.excerpt}
        </p>

        <ArticleMeta article={article} />
      </div>
    </article>
  );
}
