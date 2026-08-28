import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";

import { initAuth } from "@acme/auth";

import { env } from "~/env";

const baseUrl =
  env.VERCEL_ENV === "production"
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_ENV === "preview"
      ? `https://${env.VERCEL_URL}`
      : "http://dev.chatvolt.ai:3000";

const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : baseUrl;

export const auth = initAuth({
  baseUrl,
  productionUrl,
  secret: env.AUTH_SECRET ?? env.BETTER_AUTH_SECRET,
  // Suporta ambos os namings: AUTH_DISCORD_* (padrão) e DISCORD_CLIENT_* (legado Vercel)
  discordClientId: env.AUTH_DISCORD_ID ?? env.DISCORD_CLIENT_ID,
  discordClientSecret: env.AUTH_DISCORD_SECRET ?? env.DISCORD_CLIENT_SECRET,
  extraPlugins: [nextCookies()],
});
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
