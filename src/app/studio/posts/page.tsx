import type { Metadata } from "next";
import Link from "next/link";

import { PostCrudPanel } from "@/components/posts/post-crud-panel";
import {
  getWordPressRestBaseUrl,
  isWordPressPostCrudConfigured,
} from "@/lib/wordpress/posts";

export const metadata: Metadata = {
  title: "Post Studio",
  description: "Create, update, and delete WordPress posts from Next.js.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function PostStudioPage() {
  const restBaseUrl = getWordPressRestBaseUrl();
  const isConfigured = isWordPressPostCrudConfigured();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 md:px-8">
      <header className="space-y-3">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-widest text-ink-muted"
        >
          Back to home
        </Link>
        <h1 className="font-serif text-5xl text-ink">Post Studio</h1>
        <p className="max-w-3xl text-lg text-ink-muted">
          Manage WordPress posts from this dashboard. Changes sync through your
          configured WordPress REST API.
        </p>
      </header>

      {isConfigured ? (
        <PostCrudPanel />
      ) : (
        <section className="rounded-3xl border border-dashed border-border bg-surface p-6 text-ink-muted">
          <p className="font-semibold text-ink">Post CRUD is not configured yet.</p>
          <p className="mt-2">
            Set these env vars and restart the dev server:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>WORDPRESS_ADMIN_USERNAME</li>
            <li>WORDPRESS_APPLICATION_PASSWORD</li>
            <li>WORDPRESS_REST_URL (optional if GRAPHQL URL is set)</li>
          </ul>
          <p className="mt-3 text-sm">
            Resolved REST base: {restBaseUrl ?? "not resolved"}
          </p>
        </section>
      )}
    </div>
  );
}
