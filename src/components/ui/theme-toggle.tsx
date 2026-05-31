"use client";

import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { isHydrated, resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? SunMedium : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!isHydrated}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface transition-colors hover:border-accent"
      aria-label="Toggle color theme"
      aria-live="polite"
    >
      {isHydrated ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
    </button>
  );
}
