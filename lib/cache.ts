import { createHash } from "node:crypto";

import { db } from "./db";

const cacheTtlMs = Number(process.env.SEARCH_CACHE_TTL_MS ?? 5 * 60 * 1000);

const deleteExpiredCacheStatement = db.query(
  "DELETE FROM search_cache WHERE expires_at <= ?",
);
const findCacheEntryStatement = db.query(
  "SELECT payload_json, expires_at FROM search_cache WHERE cache_key = ?",
);
const upsertCacheEntryStatement = db.query(
  `INSERT INTO search_cache (cache_key, payload_json, expires_at)
   VALUES (?, ?, ?)
   ON CONFLICT(cache_key) DO UPDATE SET
     payload_json = excluded.payload_json,
     expires_at = excluded.expires_at`,
);

export function createSearchCacheKey(input: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function getCachedPayload<T>(cacheKey: string): T | null {
  deleteExpiredCacheStatement.run(new Date().toISOString());

  const cacheEntry = findCacheEntryStatement.get(cacheKey) as
    | { payload_json: string; expires_at: string }
    | null;

  if (!cacheEntry) {
    return null;
  }

  if (new Date(cacheEntry.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return JSON.parse(cacheEntry.payload_json) as T;
}

export function setCachedPayload(cacheKey: string, payload: unknown) {
  const expiresAt = new Date(Date.now() + cacheTtlMs).toISOString();

  upsertCacheEntryStatement.run(cacheKey, JSON.stringify(payload), expiresAt);
}
