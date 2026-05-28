"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  LoaderCircle,
  PencilLine,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { formatArticleDate } from "@/lib/utils/text";
import type { ManagedPost, PostStatus } from "@/types/content";

type PostStatusFilter = PostStatus | "all";

type PostFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
};

type ApiErrorPayload = {
  ok?: boolean;
  message?: string;
};

const statusOptions: Array<{ value: PostStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "publish", label: "Published" },
  { value: "pending", label: "Pending" },
  { value: "private", label: "Private" },
];

const defaultFormState: PostFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload.message) {
      return payload.message;
    }
  } catch {
    return "Request failed.";
  }

  return "Request failed.";
}

export function PostCrudPanel() {
  const [posts, setPosts] = useState<ManagedPost[]>([]);
  const [statusFilter, setStatusFilter] = useState<PostStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<PostFormState>(defaultFormState);

  const isEditing = activePostId !== null;

  async function loadPosts(nextFilter: PostStatusFilter) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/posts?status=${encodeURIComponent(nextFilter)}&perPage=30`,
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        ok: boolean;
        posts: ManagedPost[];
      };

      setPosts(payload.posts);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load posts from WordPress.",
      );
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPosts(statusFilter);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [statusFilter]);

  function setField<Key extends keyof PostFormState>(
    key: Key,
    value: PostFormState[Key],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setFormState(defaultFormState);
    setActivePostId(null);
  }

  function startEdit(post: ManagedPost) {
    setActivePostId(post.id);
    setNoticeMessage(null);
    setErrorMessage(null);
    setFormState({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoticeMessage(null);
    setErrorMessage(null);

    const title = formState.title.trim();
    const content = formState.content.trim();

    if (!title || !content) {
      setErrorMessage("Title and content are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const method = isEditing ? "PATCH" : "POST";
      const endpoint = isEditing ? `/api/posts/${activePostId}` : "/api/posts";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: formState.excerpt,
          slug: formState.slug,
          status: formState.status,
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        ok: boolean;
        post: ManagedPost;
      };

      setNoticeMessage(
        isEditing
          ? `Post updated: ${payload.post.title}`
          : `Post created: ${payload.post.title}`,
      );

      if (!isEditing) {
        resetForm();
      }

      await loadPosts(statusFilter);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save this post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(post: ManagedPost) {
    const confirmed = window.confirm(
      `Delete "${post.title}" permanently from WordPress?`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteTargetId(post.id);
    setNoticeMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message);
      }

      setNoticeMessage(`Post deleted: ${post.title}`);

      if (activePostId === post.id) {
        resetForm();
      }

      await loadPosts(statusFilter);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete this post.",
      );
    } finally {
      setDeleteTargetId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--card-shadow)]">
          <label className="text-sm font-semibold text-ink-muted" htmlFor="status-filter">
            Filter
          </label>
          <select
            id="status-filter"
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PostStatusFilter)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void loadPosts(statusFilter)}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-border bg-surface p-3 text-sm text-rose-600 shadow-[var(--card-shadow)] dark:text-rose-300">
            {errorMessage}
          </p>
        ) : null}

        {noticeMessage ? (
          <p className="rounded-2xl border border-border bg-surface p-3 text-sm text-accent shadow-[var(--card-shadow)]">
            {noticeMessage}
          </p>
        ) : null}

        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-surface p-5 text-ink-muted shadow-[var(--card-shadow)]">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-5 text-ink-muted shadow-[var(--card-shadow)]">
              No posts in this filter yet.
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--card-shadow)] transition-colors hover:border-accent"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl leading-tight text-ink">{post.title}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                      {post.status} • Updated {formatArticleDate(post.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(post)}
                      disabled={deleteTargetId === post.id}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rose-500 hover:text-rose-600 disabled:opacity-60"
                    >
                      {deleteTargetId === post.id ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>

                {post.excerpt ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-muted">
                    {post.excerpt}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--card-shadow)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {isEditing ? "Edit Post" : "Create Post"}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              {isEditing ? "Update article" : "Write a new article"}
            </h2>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEditing ? "Cancel edit" : "New post"}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-ink" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              value={formState.title}
              onChange={(event) => setField("title", event.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
              placeholder="The post headline"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ink" htmlFor="post-slug">
                Slug (optional)
              </label>
              <input
                id="post-slug"
                value={formState.slug}
                onChange={(event) => setField("slug", event.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
                placeholder="my-awesome-post"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-ink" htmlFor="post-status">
                Status
              </label>
              <select
                id="post-status"
                value={formState.status}
                onChange={(event) => setField("status", event.target.value as PostStatus)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
              >
                {statusOptions
                  .filter((option) => option.value !== "all")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-ink" htmlFor="post-excerpt">
              Excerpt
            </label>
            <textarea
              id="post-excerpt"
              value={formState.excerpt}
              onChange={(event) => setField("excerpt", event.target.value)}
              className="h-24 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
              placeholder="A short summary shown in article listings"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-ink" htmlFor="post-content">
              Content (HTML)
            </label>
            <textarea
              id="post-content"
              value={formState.content}
              onChange={(event) => setField("content", event.target.value)}
              className="h-64 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm leading-6 text-ink outline-none transition-colors focus:border-accent"
              placeholder="<p>Start writing your article...</p>"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
            style={{ color: "var(--accent-foreground)" }}
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Update Post" : "Create Post"}
          </button>
        </form>
      </section>
    </div>
  );
}
