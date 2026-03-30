import { z } from "zod";

const maxLimit = 50;
const responseTypeSchema = z.enum(["html", "json", "markdown", "txt"]).default("json");
const regionSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z]{2}-[a-z]{2}$/i, "region must look like wt-wt, us-en, uk-en")
  .transform((value) => value.toLowerCase());

export const getDuckDuckGoSearchSchema = z.object({
  query: z.string().trim().min(1, "query is required"),
  limit: z.coerce.number().int().min(1).max(maxLimit).default(10),
  region: regionSchema.optional(),
  response_type: responseTypeSchema,
});

export const postDuckDuckGoSearchSchema = z.object({
  limit: z.coerce.number().int().min(1).max(maxLimit).default(10),
  query: z.string().trim().min(1, "query is required"),
  region: regionSchema.optional(),
  response_type: responseTypeSchema,
});
