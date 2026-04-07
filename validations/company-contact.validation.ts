import { z } from "zod";

const domainSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""))
  .refine((value) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value), "domain must be a valid hostname like microsoft.com");

export const getCompanyContactSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  domain: domainSchema.optional(),
});

export const postCompanyContactSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  domain: domainSchema.optional(),
});
