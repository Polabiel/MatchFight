import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function authEnv() {
  return createEnv({
    server: {
      // Discord é um provider social opcional — o app funciona com email/password
      // sem ele. Aceita undefined ou vazio; o initAuth registra o provider apenas
      // quando as duas credenciais são truthy.
      // Suporta ambos os namings: AUTH_DISCORD_* (padrão) e DISCORD_CLIENT_* (legado)
      AUTH_DISCORD_ID: z.string().optional(),
      AUTH_DISCORD_SECRET: z.string().optional(),
      DISCORD_CLIENT_ID: z.string().optional(),
      DISCORD_CLIENT_SECRET: z.string().optional(),
      // Em produção, exige ao menos um dos dois (AUTH_SECRET ou BETTER_AUTH_SECRET)
      AUTH_SECRET: z.string().min(1).optional(),
      BETTER_AUTH_SECRET: z.string().min(1).optional(),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },
    runtimeEnv: process.env,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
