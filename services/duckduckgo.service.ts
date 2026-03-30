import { searchDuckDuckGo } from "../lib/duckduckgo";

export async function getDuckDuckGoSearchResults(
  query: string,
  limit: number,
  region?: string,
) {
  const results = await searchDuckDuckGo(query, limit, region);

  return {
    query,
    limit,
    region: region ?? null,
    count: results.length,
    results,
  };
}
