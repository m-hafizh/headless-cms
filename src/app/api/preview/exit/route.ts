import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function resolveRedirectPath(rawPath: string | null): string {
  if (!rawPath) {
    return "/";
  }

  if (!rawPath.startsWith("/") || rawPath.startsWith("//")) {
    return "/";
  }

  return rawPath;
}

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const redirectPath = resolveRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
  );

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
