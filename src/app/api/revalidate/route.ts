import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { CONTENT_CACHE_TAG } from "@/lib/content/service";

type RevalidatePayload = {
  secret?: string;
  tag?: string;
  path?: string;
  paths?: string[];
};

function isTruthyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeTag(value: unknown): string | null {
  if (!isTruthyString(value)) {
    return null;
  }

  return value.trim();
}

function normalizePath(value: unknown): string | null {
  if (!isTruthyString(value)) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

async function parsePayload(request: NextRequest): Promise<RevalidatePayload> {
  if (request.method !== "POST") {
    return {};
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {};
  }

  try {
    return (await request.json()) as RevalidatePayload;
  } catch {
    return {};
  }
}

async function handleRequest(request: NextRequest) {
  const configuredSecret = process.env.WORDPRESS_REVALIDATE_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "WORDPRESS_REVALIDATE_SECRET is not configured.",
      },
      { status: 500 },
    );
  }

  const payload = await parsePayload(request);
  const providedSecret =
    request.nextUrl.searchParams.get("secret") ??
    payload.secret ??
    request.headers.get("x-revalidate-secret");

  if (providedSecret !== configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid revalidation secret.",
      },
      { status: 401 },
    );
  }

  const tag =
    normalizeTag(request.nextUrl.searchParams.get("tag")) ??
    normalizeTag(payload.tag) ??
    CONTENT_CACHE_TAG;

  const paths = new Set<string>();
  const directPath =
    normalizePath(request.nextUrl.searchParams.get("path")) ??
    normalizePath(payload.path);

  if (directPath) {
    paths.add(directPath);
  }

  if (Array.isArray(payload.paths)) {
    for (const path of payload.paths) {
      const normalized = normalizePath(path);
      if (normalized) {
        paths.add(normalized);
      }
    }
  }

  revalidateTag(tag, "max");
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    revalidatedTag: tag,
    revalidatedPaths: Array.from(paths),
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
