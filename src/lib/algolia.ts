export const algoliaConfig = {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "",
  searchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? "",
  indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "",
};

export function isAlgoliaConfigured(): boolean {
  return Boolean(
    algoliaConfig.appId && algoliaConfig.searchKey && algoliaConfig.indexName,
  );
}