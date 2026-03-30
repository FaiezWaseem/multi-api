import { db } from "../lib/db";
import { generateId } from "../lib/auth";

const insertLoginLogStatement = db.query(
  "INSERT INTO login_logs (id, user_id, email, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
);
const insertSearchLogStatement = db.query(
  `INSERT INTO search_logs (
      id,
      user_id,
      api_token_id,
      query,
      region,
      result_count,
      requested_limit,
      ip_address,
      user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const listLoginLogsStatement = db.query(
  `SELECT id, user_id, email, ip_address, user_agent, created_at
   FROM login_logs
   WHERE user_id = ?
   ORDER BY created_at DESC
   LIMIT ?`,
);
const listSearchLogsStatement = db.query(
  `SELECT id, user_id, api_token_id, query, region, result_count, requested_limit, ip_address, user_agent, created_at
   FROM search_logs
   WHERE user_id = ?
   ORDER BY created_at DESC
   LIMIT ?`,
);
const insertRequestLogStatement = db.query(
  `INSERT INTO request_logs (
      id,
      user_id,
      method,
      endpoint,
      status_code,
      ip_address,
      user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
);
const listRequestLogsStatement = db.query(
  `SELECT id, user_id, method, endpoint, status_code, ip_address, user_agent, created_at
   FROM request_logs
   ORDER BY created_at DESC
   LIMIT ?`,
);
const getDailyRequestCountStatement = db.query(
  `SELECT COUNT(*) as count
   FROM request_logs
   WHERE date(created_at) = date('now')`,
);
const getMonthlyRequestCountStatement = db.query(
  `SELECT COUNT(*) as count
   FROM request_logs
   WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`,
);

export function createLoginLog(input: {
  userId: string;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  insertLoginLogStatement.run(
    generateId(),
    input.userId,
    input.email,
    input.ipAddress ?? null,
    input.userAgent ?? null,
  );
}

export function createSearchLog(input: {
  userId: string;
  apiTokenId?: string | null;
  query: string;
  region?: string | null;
  resultCount: number;
  requestedLimit: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  insertSearchLogStatement.run(
    generateId(),
    input.userId,
    input.apiTokenId ?? null,
    input.query,
    input.region ?? null,
    input.resultCount,
    input.requestedLimit,
    input.ipAddress ?? null,
    input.userAgent ?? null,
  );
}

export function createRequestLog(input: {
  userId?: string | null;
  method: string;
  endpoint: string;
  statusCode: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  insertRequestLogStatement.run(
    generateId(),
    input.userId ?? null,
    input.method,
    input.endpoint,
    input.statusCode,
    input.ipAddress ?? null,
    input.userAgent ?? null,
  );
}

export function listLoginLogsForUser(userId: string, limit = 50) {
  return listLoginLogsStatement.all(userId, limit);
}

export function listSearchLogsForUser(userId: string, limit = 50) {
  return listSearchLogsStatement.all(userId, limit);
}

export function listRequestLogs(limit = 100) {
  return listRequestLogsStatement.all(limit);
}

export function getSystemRequestMetrics() {
  const daily = getDailyRequestCountStatement.get() as { count: number } | null;
  const monthly = getMonthlyRequestCountStatement.get() as { count: number } | null;

  return {
    dailyRequests: daily?.count ?? 0,
    monthlyRequests: monthly?.count ?? 0,
  };
}
