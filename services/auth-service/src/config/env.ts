import { resolve } from "node:path";
import { config } from "dotenv";
import { z } from "zod";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

function isPlaceholder(value: string) {
  return value.startsWith("replace-with") || value.includes("your-") || value.includes("change-me");
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4001),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("PrepNexo <noreply@prepnexo.com>")
}).superRefine((env, ctx) => {
  if (env.NODE_ENV !== "production") return;

  for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const) {
    if (isPlaceholder(env[key]) || env[key].length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} must be a strong production secret of at least 32 characters`
      });
    }
  }

  if (env.RESEND_API_KEY && !env.EMAIL_FROM.includes("@")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["EMAIL_FROM"],
      message: "EMAIL_FROM must include a valid sender email when RESEND_API_KEY is set"
    });
  }

  if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GOOGLE_CLIENT_ID"],
      message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together"
    });
  }
});

export const env = envSchema.parse(process.env);
