import { z } from "zod";

const responseTypeSchema = z.enum(["html", "json", "markdown", "txt"]).default("json");
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
const urlSchema = z
  .string()
  .trim()
  .url("url must be a valid absolute URL")
  .refine((value) => /^https?:\/\//i.test(value), "url must start with http:// or https://");

const jsCodeSchema = z.string().trim().min(1).max(10_000).optional();

export const getCrawlSchema = z.object({
  url: urlSchema,
  response_type: responseTypeSchema,
  js_code: jsCodeSchema,
});

export const postCrawlSchema = z.object({
  url: urlSchema,
  response_type: responseTypeSchema,
  js_code: jsCodeSchema,
  proxy: proxySchema,
});
