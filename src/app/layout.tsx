import type { Metadata } from "next";
import { JetBrains_Mono, Lora, Manrope } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getTopCategories } from "@/lib/content/service";
import "./globals.css";

const sansFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const serifFont = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kernel Notes",
    template: "%s | Kernel Notes",
  },
  description:
    "A Medium-like editorial frontend powered by WordPress headless CMS and Next.js.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getTopCategories(6);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sansFont.variable} ${serifFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader categories={categories} />
            <main className="flex-1 py-10 md:py-14">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
