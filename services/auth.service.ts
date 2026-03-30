import { db } from "../lib/db";
import { AppError } from "../lib/app-error";
import {
  generateId,
  generateOpaqueToken,
  getTokenPrefix,
  hashPassword,
  hashToken,
  verifyPassword,
} from "../lib/auth";
import { createLoginLog } from "./log.service";

type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  is_paid: number;
  created_at: string;
};

type SessionRecord = {
  id: string;
  user_id: string;
  expires_at: string;
};

type ApiTokenLookup = {
  token_id: string;
  user_id: string;
  email: string;
  is_paid: number;
};

type StoredApiTokenRecord = {
  id: string;
  name: string;
  token_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

const sessionDurationMs = Number(process.env.AUTH_SESSION_TTL_MS ?? 7 * 24 * 60 * 60 * 1000);

const insertUserStatement = db.query(
  "INSERT INTO users (id, email, password_hash, is_paid) VALUES (?, ?, ?, ?)",
);
const findUserByEmailStatement = db.query(
  "SELECT id, email, password_hash, is_paid, created_at FROM users WHERE email = ?",
);
const insertSessionStatement = db.query(
  "INSERT INTO auth_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
);
const findSessionByHashStatement = db.query(
  `SELECT auth_sessions.id, auth_sessions.user_id, auth_sessions.expires_at, users.email, users.is_paid
   FROM auth_sessions
   JOIN users ON users.id = auth_sessions.user_id
   WHERE auth_sessions.token_hash = ?`,
);
const deleteExpiredSessionsStatement = db.query(
  "DELETE FROM auth_sessions WHERE expires_at <= ?",
);
const insertApiTokenStatement = db.query(
  "INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash) VALUES (?, ?, ?, ?, ?)",
);
const findApiTokenByHashStatement = db.query(
  `SELECT api_tokens.id AS token_id, users.id AS user_id, users.email, users.is_paid
   FROM api_tokens
   JOIN users ON users.id = api_tokens.user_id
   WHERE api_tokens.token_hash = ? AND api_tokens.revoked_at IS NULL`,
);
const touchApiTokenStatement = db.query(
  "UPDATE api_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?",
);
const listApiTokensStatement = db.query(
  "SELECT id, name, token_prefix, last_used_at, revoked_at, created_at FROM api_tokens WHERE user_id = ? ORDER BY created_at DESC",
);
const findApiTokenByIdStatement = db.query(
  "SELECT id, name, token_prefix, last_used_at, revoked_at, created_at FROM api_tokens WHERE id = ? AND user_id = ?",
);
const updateApiTokenNameStatement = db.query(
  "UPDATE api_tokens SET name = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL",
);
const revokeApiTokenStatement = db.query(
  "UPDATE api_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND revoked_at IS NULL",
);

function publicUser(user: Pick<UserRecord, "id" | "email" | "is_paid" | "created_at">) {
  return {
    id: user.id,
    email: user.email,
    isPaid: Boolean(user.is_paid),
    createdAt: user.created_at,
  };
}

export async function registerUser(email: string, password: string) {
  const existingUser = findUserByEmailStatement.get(email) as UserRecord | null;

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const userId = generateId();
  const passwordHash = await hashPassword(password);

  insertUserStatement.run(userId, email, passwordHash, 0);

  const createdUser = findUserByEmailStatement.get(email) as UserRecord;

  return publicUser(createdUser);
}

export async function loginUser(
  email: string,
  password: string,
  metadata?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const user = findUserByEmailStatement.get(email) as UserRecord | null;

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  deleteExpiredSessionsStatement.run(new Date().toISOString());

  const sessionToken = generateOpaqueToken("sess");
  const sessionTokenHash = hashToken(sessionToken);
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + sessionDurationMs).toISOString();

  insertSessionStatement.run(sessionId, user.id, sessionTokenHash, expiresAt);
  createLoginLog({
    userId: user.id,
    email: user.email,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  });

  return {
    sessionToken,
    expiresAt,
    user: publicUser(user),
  };
}

export function getUserFromSessionToken(sessionToken: string) {
  deleteExpiredSessionsStatement.run(new Date().toISOString());

  const session = findSessionByHashStatement.get(hashToken(sessionToken)) as
    | (SessionRecord & { email: string; is_paid: number })
    | null;

  if (!session) {
    return null;
  }

  return {
    id: session.user_id,
    email: session.email,
    isPaid: Boolean(session.is_paid),
  };
}

export function createApiTokenForUser(userId: string, name: string) {
  const apiToken = generateOpaqueToken("ddg");
  const tokenId = generateId();

  insertApiTokenStatement.run(
    tokenId,
    userId,
    name,
    getTokenPrefix(apiToken),
    hashToken(apiToken),
  );

  return {
    id: tokenId,
    name,
    token: apiToken,
    tokenPrefix: getTokenPrefix(apiToken),
  };
}

export function listApiTokensForUser(userId: string) {
  return listApiTokensStatement.all(userId);
}

export function renameApiTokenForUser(userId: string, tokenId: string, name: string) {
  const existingToken = findApiTokenByIdStatement.get(tokenId, userId) as StoredApiTokenRecord | null;

  if (!existingToken) {
    throw new AppError("API token not found.", 404);
  }

  if (existingToken.revoked_at) {
    throw new AppError("API token has already been revoked.", 400);
  }

  updateApiTokenNameStatement.run(name, tokenId, userId);

  return findApiTokenByIdStatement.get(tokenId, userId);
}

export function revokeApiTokenForUser(userId: string, tokenId: string) {
  const existingToken = findApiTokenByIdStatement.get(tokenId, userId) as StoredApiTokenRecord | null;

  if (!existingToken) {
    throw new AppError("API token not found.", 404);
  }

  if (existingToken.revoked_at) {
    throw new AppError("API token has already been revoked.", 400);
  }

  revokeApiTokenStatement.run(tokenId, userId);

  return {
    id: tokenId,
    revoked: true,
  };
}

export function getApiConsumerFromToken(apiToken: string) {
  const tokenRecord = findApiTokenByHashStatement.get(hashToken(apiToken)) as ApiTokenLookup | null;

  if (!tokenRecord) {
    return null;
  }

  touchApiTokenStatement.run(tokenRecord.token_id);

  return {
    id: tokenRecord.user_id,
    email: tokenRecord.email,
    tokenId: tokenRecord.token_id,
    tier: tokenRecord.is_paid ? "paid" : "auth",
  } as const;
}
