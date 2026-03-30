import { createHash, randomBytes, randomUUID } from "node:crypto";

export function generateId() {
  return randomUUID();
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOpaqueToken(prefix: string) {
  const secret = randomBytes(32).toString("hex");
  return `${prefix}_${secret}`;
}

export function getTokenPrefix(token: string) {
  return token.slice(0, 12);
}

export async function hashPassword(password: string) {
  return Bun.password.hash(password);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return Bun.password.verify(password, passwordHash);
}
