import type { Article } from "@/types/content";
import { formatArticleDate } from "@/lib/utils/text";

type ArticleMetaProps = {
  article: Article;
  compact?: boolean;
};

export function ArticleMeta({ article, compact = false }: ArticleMetaProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-sm text-ink-muted ${
        compact ? "" : "md:text-base"
      }`}
    >
      <span className="font-medium text-ink">{article.author.name}</span>
      <span aria-hidden>·</span>
      <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span>{article.readingTimeMinutes} min read</span>
    </div>
  );
}
