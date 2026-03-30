import { searchDuckDuckGo } from "../lib/duckduckgo";
import { createSearchLog } from "./log.service";

export async function getDuckDuckGoSearchResults(
  query: string,
  limit: number,
  region?: string,
  metadata?: {
    userId?: string;
    apiTokenId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const results = await searchDuckDuckGo(query, limit, region);

  if (metadata?.userId) {
    createSearchLog({
      userId: metadata.userId,
      apiTokenId: metadata.apiTokenId,
      query,
      region,
      resultCount: results.length,
      requestedLimit: limit,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }

  return {
    query,
    limit,
    region: region ?? null,
    count: results.length,
    results,
  };
}
