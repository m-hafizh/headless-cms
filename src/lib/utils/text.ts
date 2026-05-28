import { format } from "date-fns";

const HTML_TAG_REGEX = /<[^>]+>/g;
const HTML_ENTITY_REGEX = /&#?([a-zA-Z0-9]+);/g;

const entityMap: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeHtmlEntities(value: string): string {
  return value.replace(HTML_ENTITY_REGEX, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    return entityMap[entity] ?? match;
  });
}

export function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(HTML_TAG_REGEX, " ")).replace(/\s+/g, " ").trim();
}

export function trimText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function estimateReadingTimeFromHtml(html: string): number {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatArticleDate(value: string): string {
  return format(new Date(value), "MMM d, yyyy");
}
