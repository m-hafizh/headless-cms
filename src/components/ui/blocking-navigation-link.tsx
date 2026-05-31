"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { MouseEvent, ReactNode, useTransition } from "react";

type BlockingNavigationLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  loadingText?: string;
  onNavigateStart?: () => void;
};

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function BlockingNavigationLink({
  href,
  className,
  children,
  loadingText = "Loading page...",
  onNavigateStart,
}: BlockingNavigationLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    onNavigateStart?.();
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <>
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>

      {isPending ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label={loadingText}
        >
          <div className="rounded-2xl border border-white/20 bg-black/40 px-5 py-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <p className="text-sm font-semibold">{loadingText}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}