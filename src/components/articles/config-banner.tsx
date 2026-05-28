type ConfigBannerProps = {
  isWordPressConnected: boolean;
};

export function ConfigBanner({ isWordPressConnected }: ConfigBannerProps) {
  if (isWordPressConnected) {
    return null;
  }

  return (
    <aside className="rounded-2xl border border-dashed border-border bg-surface p-4 text-sm text-ink-muted">
      <p>
        Running with local sample content because WORDPRESS_GRAPHQL_URL is not set.
      </p>
      <p className="mt-2">
        Add your WordPress endpoint in .env.local to switch this UI to live CMS data.
      </p>
    </aside>
  );
}
