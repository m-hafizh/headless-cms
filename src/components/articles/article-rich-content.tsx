type ArticleRichContentProps = {
  contentHtml: string;
};

export function ArticleRichContent({ contentHtml }: ArticleRichContentProps) {
  return (
    <section
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
