import type { Article, Author, Category } from "@/types/content";

export const sampleAuthors: Author[] = [
  {
    id: "author-1",
    name: "Ari Patel",
    slug: "ari-patel",
    bio: "Platform engineer focused on reliability, distributed systems, and practical SRE playbooks.",
    avatarUrl: null,
  },
  {
    id: "author-2",
    name: "Mina Alvarez",
    slug: "mina-alvarez",
    bio: "Frontend architect exploring design systems, performance budgets, and accessible UX.",
    avatarUrl: null,
  },
];

export const sampleCategories: Category[] = [
  {
    id: "category-1",
    name: "Architecture",
    slug: "architecture",
    description: "System design, tradeoffs, and production patterns.",
  },
  {
    id: "category-2",
    name: "Frontend",
    slug: "frontend",
    description: "Modern web interfaces, rendering strategies, and UX engineering.",
  },
  {
    id: "category-3",
    name: "DevOps",
    slug: "devops",
    description: "Delivery pipelines, infrastructure automation, and observability.",
  },
];

const [architecture, frontend, devops] = sampleCategories;
const [ari, mina] = sampleAuthors;

export const sampleArticles: Article[] = [
  {
    id: "article-1",
    slug: "event-driven-cms-webhooks-nextjs",
    title: "Event-Driven Publishing with Webhooks and Next.js Revalidation",
    excerpt:
      "Design a clean publish flow where WordPress events trigger precise Next.js cache invalidation without rebuilding everything.",
    contentHtml: `
      <p>When your editorial team hits publish, they expect content to appear immediately. Full rebuilds can make that feel slow and unreliable.</p>
      <p>A more resilient flow is event-driven: WordPress emits publish and update events, and your frontend revalidates only the affected routes.</p>
      <h2>Minimal revalidation endpoint</h2>
      <pre><code class="language-ts">import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const body = await req.json();
  if (body.secret !== process.env.WORDPRESS_REVALIDATE_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  revalidateTag("wp-content");
  return Response.json({ revalidated: true });
}
</code></pre>
      <p>Tag-based cache invalidation keeps the model simple while remaining granular enough for most publishing use cases.</p>
    `,
    coverImageUrl: null,
    coverImageAlt: "Abstract block pattern",
    publishedAt: "2026-05-10T09:15:00.000Z",
    updatedAt: "2026-05-11T08:00:00.000Z",
    readingTimeMinutes: 7,
    category: architecture,
    tags: ["nextjs", "wordpress", "caching"],
    author: ari,
    seo: {
      title: "Event-Driven Publishing with Next.js Revalidation",
      description:
        "Use WordPress publish webhooks and Next.js tags to invalidate only what changed.",
    },
    isFeatured: true,
  },
  {
    id: "article-2",
    slug: "editorial-design-tokens-for-technical-blogs",
    title: "Editorial Design Tokens for Technical Blogs",
    excerpt:
      "Move beyond generic templates by defining a typography and spacing token system that keeps long-form technical content readable.",
    contentHtml: `
      <p>Technical writing usually fails in one of two ways: cramped lines or visual noise. A tokenized editorial system prevents both.</p>
      <h2>Start with measurable defaults</h2>
      <ul>
        <li>Body width around 65 to 72 characters</li>
        <li>Body line-height between 1.6 and 1.75</li>
        <li>A strict 8px spacing rhythm</li>
      </ul>
      <p>Once tokens are set, every component becomes easier to reason about. You stop styling one page at a time and start building a coherent publication.</p>
    `,
    coverImageUrl: null,
    coverImageAlt: "Typographic layout sketch",
    publishedAt: "2026-05-08T13:30:00.000Z",
    updatedAt: "2026-05-08T13:30:00.000Z",
    readingTimeMinutes: 5,
    category: frontend,
    tags: ["design-system", "css", "typography"],
    author: mina,
    seo: {
      title: "Editorial Design Tokens for Technical Blogs",
      description:
        "Build a readable and scalable visual system for long-form IT content.",
    },
    isFeatured: false,
  },
  {
    id: "article-3",
    slug: "algolia-indexing-pipeline-from-wordpress",
    title: "Build a Reliable Algolia Indexing Pipeline from WordPress",
    excerpt:
      "Keep search results fresh by indexing on create, update, and delete events with idempotent payloads.",
    contentHtml: `
      <p>Search quality is as much about freshness as relevance. For editorial products, stale results break trust quickly.</p>
      <h2>Event hooks to wire</h2>
      <p>Publish, update, and delete should all emit indexing jobs. Include slug, title, excerpt, category, and published date in every payload.</p>
      <pre><code class="language-php">add_action("save_post_post", "index_post_in_algolia", 10, 3);
add_action("before_delete_post", "remove_post_from_algolia");
</code></pre>
      <p>Use deterministic object IDs so retries do not create duplicates.</p>
    `,
    coverImageUrl: null,
    coverImageAlt: "Search index workflow diagram",
    publishedAt: "2026-05-05T11:05:00.000Z",
    updatedAt: "2026-05-07T07:10:00.000Z",
    readingTimeMinutes: 6,
    category: devops,
    tags: ["algolia", "search", "wordpress"],
    author: ari,
    seo: {
      title: "Reliable Algolia Indexing Pipeline for WordPress",
      description:
        "Implement event-driven indexing for fast and accurate technical content search.",
    },
    isFeatured: false,
  },
  {
    id: "article-4",
    slug: "shipping-dark-mode-with-content-first-ux",
    title: "Shipping Dark Mode Without Hurting Reading Comfort",
    excerpt:
      "Dark mode is expected by engineering audiences, but contrast and syntax themes must be tuned for long reading sessions.",
    contentHtml: `
      <p>Dark mode for blogs is not a color inversion problem. It is a readability and hierarchy problem.</p>
      <p>Prioritize contrast for body text first, then tune accents and decorative surfaces second.</p>
      <h2>Checklist</h2>
      <ul>
        <li>Text contrast at least 7:1 for body copy</li>
        <li>Code background distinct from page background</li>
        <li>Focus rings visible in both themes</li>
      </ul>
    `,
    coverImageUrl: null,
    coverImageAlt: "Dark mode interface sample",
    publishedAt: "2026-05-02T16:40:00.000Z",
    updatedAt: "2026-05-02T16:40:00.000Z",
    readingTimeMinutes: 4,
    category: frontend,
    tags: ["dark-mode", "accessibility", "ux"],
    author: mina,
    seo: {
      title: "Shipping Dark Mode for Long-Form Technical Content",
      description:
        "A practical approach to dark mode contrast, syntax highlighting, and accessible focus states.",
    },
    isFeatured: false,
  },
];
