import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CONTENT_CACHE_TAG } from "@/lib/content/service";
import { isStudioEnabled } from "@/lib/feature-flags";
import {
  deleteManagedPost,
  getManagedPostById,
  isWordPressPostCrudConfigured,
  updateManagedPost,
  WordPressApiError,
} from "@/lib/wordpress/posts";

const statusOptions = ["draft", "publish", "pending", "private"] as const;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const updatePostSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    slug: z.string().optional(),
    status: z.enum(statusOptions).optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.content !== undefined ||
      value.excerpt !== undefined ||
      value.slug !== undefined ||
      value.status !== undefined,
    {
      message: "At least one field is required.",
    },
  );

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseId(rawId: string): number | null {
  const id = Number.parseInt(rawId, 10);

  if (Number.isNaN(id) || id <= 0) {
    return null;
  }

  return id;
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

export async function GET(_request: NextRequest, context: RouteContext) {
  const configError = verifyCrudConfig();
  if (configError) {
    return configError;
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid post id.",
      },
      { status: 400 },
    );
  }

  try {
    const post = await getManagedPostById(id);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return handleWordPressError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const configError = verifyCrudConfig();
  if (configError) {
    return configError;
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid post id.",
      },
      { status: 400 },
    );
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

  const parsedInput = updatePostSchema.safeParse(parsedJson);
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

  const nextSlug = sanitizeSlug(parsedInput.data.slug);
  if (nextSlug && !slugPattern.test(nextSlug)) {
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
    const previousPost = await getManagedPostById(id);

    const updated = await updateManagedPost(id, {
      ...parsedInput.data,
      slug: nextSlug,
    });

    revalidateTag(CONTENT_CACHE_TAG, "max");
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(`/blog/${previousPost.slug}`);
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath(`/articles/${previousPost.slug}`);
    revalidatePath(`/articles/${updated.slug}`);

    return NextResponse.json({
      ok: true,
      post: updated,
    });
  } catch (error) {
    return handleWordPressError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const configError = verifyCrudConfig();
  if (configError) {
    return configError;
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid post id.",
      },
      { status: 400 },
    );
  }

  try {
    const previousPost = await getManagedPostById(id);
    await deleteManagedPost(id);

    revalidateTag(CONTENT_CACHE_TAG, "max");
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(`/blog/${previousPost.slug}`);
    revalidatePath(`/articles/${previousPost.slug}`);

    return NextResponse.json({
      ok: true,
      deletedId: id,
    });
  } catch (error) {
    return handleWordPressError(error);
  }
}
