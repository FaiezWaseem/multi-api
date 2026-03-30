import { db } from "../lib/db";
import { AppError } from "../lib/app-error";
import { generateId } from "../lib/auth";
import { getSystemRequestMetrics, listRequestLogs } from "./log.service";

type AdminUserRow = {
  id: string;
  email: string;
  is_paid: number;
  is_admin: number;
  credits: number;
  created_at: string;
};

const listUsersStatement = db.query(
  `SELECT id, email, is_paid, is_admin, credits, created_at
   FROM users
   ORDER BY created_at DESC`,
);
const findUserByIdStatement = db.query(
  `SELECT id, email, is_paid, is_admin, credits, created_at
   FROM users
   WHERE id = ?`,
);
const updateUserCreditsStatement = db.query(
  `UPDATE users
   SET credits = ?, updated_at = CURRENT_TIMESTAMP
   WHERE id = ?`,
);
const insertCreditTransactionStatement = db.query(
  `INSERT INTO credit_transactions (
      id,
      user_id,
      admin_user_id,
      amount,
      balance_after,
      note
    ) VALUES (?, ?, ?, ?, ?, ?)`,
);

function mapUser(user: AdminUserRow) {
  return {
    id: user.id,
    email: user.email,
    isPaid: Boolean(user.is_paid),
    isAdmin: Boolean(user.is_admin),
    credits: user.credits,
    createdAt: user.created_at,
  };
}

export function getAdminMetrics() {
  return getSystemRequestMetrics();
}

export function getAdminRequestLogs(limit = 100) {
  return listRequestLogs(limit);
}

export function getAdminUsers() {
  return (listUsersStatement.all() as AdminUserRow[]).map(mapUser);
}

export function addCreditsToUser(adminUserId: string, userId: string, amount: number, note?: string) {
  const user = findUserByIdStatement.get(userId) as AdminUserRow | null;

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const balanceAfter = user.credits + amount;

  updateUserCreditsStatement.run(balanceAfter, userId);
  insertCreditTransactionStatement.run(
    generateId(),
    userId,
    adminUserId,
    amount,
    balanceAfter,
    note?.trim() || null,
  );

  const updatedUser = findUserByIdStatement.get(userId) as AdminUserRow;

  return {
    user: mapUser(updatedUser),
    creditedAmount: amount,
    balanceAfter,
    note: note?.trim() || null,
  };
}
