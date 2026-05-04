import { AppError } from "../lib/app-error";
import {
  formatYelpResultsAsMarkdown,
  formatYelpResultsAsText,
  type SearchResponseType,
  searchYelp,
} from "../lib/yelp";
import { createSearchCacheKey, getCachedPayload, setCachedPayload } from "../lib/cache";
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

export async function getYelpSearchResults(
  query: string,
  location: string,
  limit: number,
  responseType: SearchResponseType = "json",
  cursor?: string,
  proxy?: ProxyConfig,
  options?: {
    includeReviews?: boolean;
    includeContact?: boolean;
    enrichment?: {
      findEmail?: boolean;
      findWebsite?: boolean;
    };
  },
  metadata?: {
    userId?: string;
    apiTokenId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const offset = decodeOffsetCursor(cursor);
  const cacheEnabled = !proxy;
  const normalizedOptions = {
    includeReviews: options?.includeReviews ?? false,
    includeContact: options?.includeContact ?? false,
    enrichment: {
      findEmail: options?.enrichment?.findEmail ?? false,
      findWebsite: options?.enrichment?.findWebsite ?? false,
    },
  };
  const rawCacheKey = createSearchCacheKey({
    version: 1,
    provider: "yelp",
    query,
    location,
    window: Math.max(rawSearchResultWindow, offset + limit),
    includeReviews: normalizedOptions.includeReviews,
    includeContact: normalizedOptions.includeContact,
    findEmail: normalizedOptions.enrichment.findEmail,
    findWebsite: normalizedOptions.enrichment.findWebsite,
  });

  let rawPayload = cacheEnabled
    ? getCachedPayload<Awaited<ReturnType<typeof searchYelp>>>(rawCacheKey)
    : null;

  if (!rawPayload || rawPayload.results.length < offset + limit) {
    rawPayload = await searchYelp(query, location, {
      limit: Math.max(rawSearchResultWindow, offset + limit),
      includeReviews: normalizedOptions.includeReviews,
      includeContact: normalizedOptions.includeContact,
      enrichment: normalizedOptions.enrichment,
      proxy,
    });

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
      query: `${query} @ ${location}`,
      region: null,
      resultCount: pageResults.length,
      requestedLimit: limit,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }

  if (responseType === "html") {
    return {
      query,
      location,
      limit,
      responseType,
      nextCursor,
      content: rawPayload.html,
    };
  }

  if (responseType === "markdown") {
    return {
      query,
      location,
      limit,
      responseType,
      nextCursor,
      content: formatYelpResultsAsMarkdown(pageResults),
    };
  }

  if (responseType === "txt") {
    return {
      query,
      location,
      limit,
      responseType,
      nextCursor,
      content: formatYelpResultsAsText(pageResults),
    };
  }

  return {
    query,
    location,
    limit,
    responseType,
    nextCursor,
    count: pageResults.length,
    includeReviews: normalizedOptions.includeReviews,
    includeContact: normalizedOptions.includeContact,
    enrichment: normalizedOptions.enrichment,
    results: pageResults,
  };
}
