import { z } from "zod";

const maxLimit = 50;
const cursorSchema = z.string().trim().min(1).optional();
const responseTypeSchema = z.enum(["html", "json", "markdown", "txt"]).default("json");
const booleanFlagSchema = z.coerce.boolean().default(false);
const proxySchema = z
  .object({
    server: z
      .string()
      .trim()
      .min(1, "proxy.server is required")
      .regex(/^(https?|socks5):\/\//i, "proxy.server must start with http://, https://, or socks5://"),
    username: z.string().trim().min(1).optional(),
    password: z.string().optional(),
    bypass: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.password && !value.username) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "proxy.username is required when proxy.password is provided",
      });
    }
  })
  .optional();
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
  cursor: cursorSchema,
});

export const postDuckDuckGoSearchSchema = z.object({
  limit: z.coerce.number().int().min(1).max(maxLimit).default(10),
  query: z.string().trim().min(1, "query is required"),
  region: regionSchema.optional(),
  response_type: responseTypeSchema,
  cursor: cursorSchema,
  proxy: proxySchema,
});

export const getGoogleSearchSchema = getDuckDuckGoSearchSchema;

export const postGoogleSearchSchema = postDuckDuckGoSearchSchema;

export const getYelpSearchSchema = z.object({
  query: z.string().trim().min(1, "query is required"),
  location: z.string().trim().min(1, "location is required"),
  limit: z.coerce.number().int().min(1).max(maxLimit).default(10),
  response_type: responseTypeSchema,
  cursor: cursorSchema,
  include_reviews: booleanFlagSchema,
  include_contact: booleanFlagSchema,
  find_email: booleanFlagSchema,
  find_website: booleanFlagSchema,
});

export const postYelpSearchSchema = z.object({
  query: z.string().trim().min(1, "query is required"),
  location: z.string().trim().min(1, "location is required"),
  limit: z.coerce.number().int().min(1).max(maxLimit).default(10),
  response_type: responseTypeSchema,
  cursor: cursorSchema,
  include_reviews: booleanFlagSchema,
  include_contact: booleanFlagSchema,
  find_email: booleanFlagSchema,
  find_website: booleanFlagSchema,
  proxy: proxySchema,
});
