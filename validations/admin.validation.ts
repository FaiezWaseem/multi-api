import { z } from "zod";

export const adminUserIdParamSchema = z.object({
  id: z.string().trim().min(1, "user id is required"),
});

export const adminCreditAdjustmentSchema = z.object({
  amount: z.coerce.number().int().min(1, "amount must be at least 1"),
  note: z.string().trim().max(500).optional(),
});
