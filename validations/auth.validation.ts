import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, "password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, "password is required"),
});

export const createApiTokenSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100),
});

export const updateApiTokenSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100),
});

export const apiTokenIdParamSchema = z.object({
  id: z.string().trim().min(1, "token id is required"),
});
