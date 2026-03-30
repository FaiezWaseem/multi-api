import { type SearchResponseType, searchDuckDuckGo } from "../lib/duckduckgo";
import { createSearchLog } from "./log.service";

function toMarkdown(results: Awaited<ReturnType<typeof searchDuckDuckGo>>["results"]) {
  return results
    .map((result, index) => {
      const snippetLine = result.snippet ? `\n\n${result.snippet}` : "";
      return `${index + 1}. [${result.title}](${result.url})${snippetLine}`;
    })
    .join("\n\n");
}

function toText(results: Awaited<ReturnType<typeof searchDuckDuckGo>>["results"]) {
  return results
    .map((result, index) => {
      const snippetLine = result.snippet ? `\n${result.snippet}` : "";
      return `${index + 1}. ${result.title}\n${result.url}${snippetLine}`;
    })
    .join("\n\n");
}

export async function getDuckDuckGoSearchResults(
  query: string,
  limit: number,
  region?: string,
  responseType: SearchResponseType = "json",
  metadata?: {
    userId?: string;
    apiTokenId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const searchPayload = await searchDuckDuckGo(query, limit, region);
  const { results, html } = searchPayload;

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

  if (responseType === "html") {
    return {
      query,
      limit,
      region: region ?? null,
      responseType,
      content: html,
    };
  }

  if (responseType === "markdown") {
    return {
      query,
      limit,
      region: region ?? null,
      responseType,
      content: toMarkdown(results),
    };
  }

  if (responseType === "txt") {
    return {
      query,
      limit,
      region: region ?? null,
      responseType,
      content: toText(results),
    };
  }

  return {
    query,
    limit,
    region: region ?? null,
    responseType,
    count: results.length,
    results,
  };
}
