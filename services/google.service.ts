import { AppError } from "../lib/app-error";
import { createSearchCacheKey, getCachedPayload, setCachedPayload } from "../lib/cache";
import { type SearchResponseType, searchGoogle } from "../lib/google";
import type { ProxyConfig } from "../lib/proxy";
import { createSearchLog } from "./log.service";

const rawSearchResultWindow = 50;

function encodeOffsetCursor(nextOffset: number) {
  return Buffer.from(JSON.stringify({ offset: nextOffset }), "utf8").toString("base64url");
}

function decodeOffsetCursor(cursor?: string) {
  if (!cursor) {
    return 0;
  }

  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      offset: number;
    };

    if (
      typeof decoded.offset !== "number" ||
      !Number.isFinite(decoded.offset) ||
      decoded.offset < 0
    ) {
      throw new Error("Invalid cursor");
    }

    return decoded.offset;
  } catch {
    throw new AppError("Invalid cursor.", 400);
  }
}

function toMarkdown(results: Awaited<ReturnType<typeof searchGoogle>>["results"]) {
  return results
    .map((result, index) => {
      const snippetLine = result.snippet ? `\n\n${result.snippet}` : "";
      return `${index + 1}. [${result.title}](${result.url})${snippetLine}`;
    })
    .join("\n\n");
}

function toText(results: Awaited<ReturnType<typeof searchGoogle>>["results"]) {
  return results
    .map((result, index) => {
      const snippetLine = result.snippet ? `\n${result.snippet}` : "";
      return `${index + 1}. ${result.title}\n${result.url}${snippetLine}`;
    })
    .join("\n\n");
}

export async function getGoogleSearchResults(
  query: string,
  limit: number,
  region?: string,
  responseType: SearchResponseType = "json",
  cursor?: string,
  proxy?: ProxyConfig,
  metadata?: {
    userId?: string;
    apiTokenId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const offset = decodeOffsetCursor(cursor);
  const cacheEnabled = !proxy;
  const rawCacheKey = createSearchCacheKey({
    version: 1,
    provider: "google",
    query,
    region: region ?? null,
    window: Math.max(rawSearchResultWindow, offset + limit),
  });

  let rawPayload = cacheEnabled
    ? getCachedPayload<Awaited<ReturnType<typeof searchGoogle>>>(rawCacheKey)
    : null;

  if (!rawPayload || rawPayload.results.length < offset + limit) {
    rawPayload = await searchGoogle(
      query,
      Math.max(rawSearchResultWindow, offset + limit),
      region,
      proxy,
    );

    if (cacheEnabled) {
      setCachedPayload(rawCacheKey, rawPayload);
    }
  }

  const pageResults = rawPayload.results.slice(offset, offset + limit);
  const nextCursor =
    rawPayload.results.length > offset + pageResults.length && pageResults.length > 0
      ? encodeOffsetCursor(offset + pageResults.length)
      : null;

  if (metadata?.userId) {
    createSearchLog({
      userId: metadata.userId,
      apiTokenId: metadata.apiTokenId,
      query,
      region,
      resultCount: pageResults.length,
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
      nextCursor,
      content: rawPayload.html,
    };
  }

  if (responseType === "markdown") {
    return {
      query,
      limit,
      region: region ?? null,
      responseType,
      nextCursor,
      content: toMarkdown(pageResults),
    };
  }

  if (responseType === "txt") {
    return {
      query,
      limit,
      region: region ?? null,
      responseType,
      nextCursor,
      content: toText(pageResults),
    };
  }

  return {
    query,
    limit,
    region: region ?? null,
    responseType,
    nextCursor,
    count: pageResults.length,
    results: pageResults,
  };
}
