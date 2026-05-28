import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function resolveSlug(rawSlug: string): string | null {
  let candidate = rawSlug.trim();

  if (!candidate) {
    return null;
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    try {
      candidate = new URL(candidate).pathname;
    } catch {
      return null;
    }
  }

  const normalized = candidate.replace(/^\/+|\/+$/g, "");

  if (!normalized) {
    return null;
  }

  const segment = normalized.split("/").filter(Boolean).at(-1) ?? "";

  if (!segment || segment.includes("..")) {
    return null;
  }

  return segment;
}

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.WORDPRESS_PREVIEW_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "WORDPRESS_PREVIEW_SECRET is not configured.",
      },
      { status: 500 },
    );
  }

  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid preview secret.",
      },
      { status: 401 },
    );
  }

  const rawSlug =
    request.nextUrl.searchParams.get("slug") ??
    request.nextUrl.searchParams.get("post");
  const slug = rawSlug ? resolveSlug(rawSlug) : null;

  if (!slug) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing or invalid slug query parameter.",
      },
      { status: 400 },
    );
  }

  const draft = await draftMode();
  draft.enable();

  const redirectUrl = new URL(`/articles/${encodeURIComponent(slug)}`, request.url);
  redirectUrl.searchParams.set("preview", "1");

  return NextResponse.redirect(redirectUrl);
}
