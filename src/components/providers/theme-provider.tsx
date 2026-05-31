"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  isHydrated: boolean;
  setTheme: (theme: Theme) => void;
};

const THEME_STORAGE_KEY = "kernel-notes-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const EMPTY_UNSUBSCRIBE = () => {};

const emptySubscribe = () => EMPTY_UNSUBSCRIBE;

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

function subscribeSystemTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return EMPTY_UNSUBSCRIBE;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getSystemThemeSnapshot(): ResolvedTheme {
  return getSystemTheme();
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const systemTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    () => "light",
  );
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const root = document.documentElement;

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isHydrated, resolvedTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isHydrated,
      setTheme,
    }),
    [isHydrated, resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
