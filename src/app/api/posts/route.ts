import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CONTENT_CACHE_TAG } from "@/lib/content/service";
import { isStudioEnabled } from "@/lib/feature-flags";
import {
  createManagedPost,
  isWordPressPostCrudConfigured,
  listManagedPosts,
  WordPressApiError,
} from "@/lib/wordpress/posts";
import type { PostStatus } from "@/types/content";

const statusOptions = ["draft", "publish", "pending", "private"] as const;
const statusOptionsWithAll = [...statusOptions, "all"] as const;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().min(1, "Content is required."),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(statusOptions).default("draft"),
});

function isValidStatus(value: string): value is PostStatus | "all" {
  return (statusOptionsWithAll as readonly string[]).includes(value);
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function sanitizeSlug(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

function handleWordPressError(error: unknown): NextResponse {
  if (error instanceof WordPressApiError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
        details: error.details,
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Unexpected error while talking to WordPress.",
    },
    { status: 500 },
  );
}

function verifyCrudConfig(): NextResponse | null {
  if (!isStudioEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Not found.",
      },
      { status: 404 },
    );
  }

  if (isWordPressPostCrudConfigured()) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "WordPress CRUD is not configured. Set WORDPRESS_ADMIN_USERNAME and WORDPRESS_APPLICATION_PASSWORD.",
    },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  const configError = verifyCrudConfig();
  if (configError) {
    return configError;
  }

  const statusParam = request.nextUrl.searchParams.get("status") ?? "all";
  if (!isValidStatus(statusParam)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid status filter.",
      },
      { status: 400 },
    );
  }

  const page = parsePositiveInteger(request.nextUrl.searchParams.get("page"), 1);
  const perPage = parsePositiveInteger(
    request.nextUrl.searchParams.get("perPage"),
    20,
  );

  try {
    const posts = await listManagedPosts({
      page,
      perPage,
      status: statusParam,
    });

    return NextResponse.json({
      ok: true,
      posts,
    });
  } catch (error) {
    return handleWordPressError(error);
  }
}

export async function POST(request: NextRequest) {
  const configError = verifyCrudConfig();
  if (configError) {
    return configError;
  }

  let parsedJson: unknown;

  try {
    parsedJson = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const parsedInput = createPostSchema.safeParse(parsedJson);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Validation failed.",
        details: parsedInput.error.flatten(),
      },
      { status: 400 },
    );
  }

  const slug = sanitizeSlug(parsedInput.data.slug);
  if (slug && !slugPattern.test(slug)) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Invalid slug format. Use lowercase letters, numbers, and single hyphens.",
      },
      { status: 400 },
    );
  }

  try {
    const created = await createManagedPost({
      ...parsedInput.data,
      slug,
    });

    revalidateTag(CONTENT_CACHE_TAG, "max");
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(`/blog/${created.slug}`);
    revalidatePath(`/articles/${created.slug}`);

    return NextResponse.json(
      {
        ok: true,
        post: created,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleWordPressError(error);
  }
}
