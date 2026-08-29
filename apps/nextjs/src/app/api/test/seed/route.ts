import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";

import { db } from "@acme/db/client";
import * as schema from "@acme/db/schema";

import { env } from "~/env";

/**
 * IDs fixos dos dados de teste — referenciados pelas specs Cypress.
 */
export const TEST_USER_IDS = {
  me: "e2e-me",
  opponent: "e2e-opponent",
  candidate: "e2e-candidate",
} as const;

export const TEST_FIGHT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Gera o valor do cookie de sessão no mesmo formato que o better-auth/better-call:
 * encodeURIComponent(`${token}.${base64(hmacSha256(secret, token))}`)
 */
function signSessionToken(token: string, secret: string) {
  const hmac = createHmac("sha256", secret).update(token).digest("base64");
  return encodeURIComponent(`${token}.${hmac}`);
}

/**
 * Rota de teste (E2E): popula o banco com dados determinísticos e devolve um
 * cookie de sessão válido para o usuário logado.
 *
 * Apenas disponível fora de produção. As specs Cypress chamam esta rota via
 * `cy.request()` e setam o cookie retornado antes de visitar as telas.
 */
export async function GET() {
  if (env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seed route not allowed in production" },
      { status: 403 },
    );
  }

  const secret = env.AUTH_SECRET ?? env.BETTER_AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "AUTH_SECRET not set" }, { status: 500 });
  }

  const now = new Date();
  const testUserIds = Object.values(TEST_USER_IDS);

  // Limpa dados anteriores (FKs em cascade removem profile/fight/messages/session)
  await db.delete(schema.user).where(inArray(schema.user.id, testUserIds));

  // Usuários
  await db.insert(schema.user).values([
    {
      id: TEST_USER_IDS.me,
      name: "Thiago Silva",
      email: "thiago.e2e@matchfight.test",
      emailVerified: true,
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Thiago",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: TEST_USER_IDS.opponent,
      name: "Anderson K.",
      email: "anderson.e2e@matchfight.test",
      emailVerified: true,
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Anderson",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: TEST_USER_IDS.candidate,
      name: "José Carlos",
      email: "jose.e2e@matchfight.test",
      emailVerified: true,
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Jose",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Perfis
  await db.insert(schema.Profile).values([
    {
      id: "e2e-profile-me",
      userId: TEST_USER_IDS.me,
      nickname: "Thiago",
      bio: "Striker especialista em muay thai.",
      role: "fighter",
      weightClass: "lightweight",
      wins: 14,
      losses: 2,
      location: "São Paulo, SP",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e2e-profile-opponent",
      userId: TEST_USER_IDS.opponent,
      nickname: "Anderson",
      bio: "Faixa preta de Jiu-Jitsu.",
      role: "fighter",
      weightClass: "lightweight",
      wins: 12,
      losses: 4,
      location: "Rio de Janeiro, RJ",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e2e-profile-candidate",
      userId: TEST_USER_IDS.candidate,
      nickname: "José",
      bio: "Boxeador olímpico transicionando para MMA.",
      role: "fighter",
      weightClass: "lightweight",
      wins: 8,
      losses: 6,
      location: "Curitiba, PR",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Luta agendada (me vs opponent)
  await db.insert(schema.Fight).values({
    id: TEST_FIGHT_ID,
    fighter1Id: TEST_USER_IDS.me,
    fighter2Id: TEST_USER_IDS.opponent,
    status: "scheduled",
    location: "Chute Boxe, PR",
    scheduledAt: new Date("2026-11-22T19:00:00Z"),
    createdById: TEST_USER_IDS.me,
    createdAt: now,
    updatedAt: now,
  });

  // Mensagens do chat
  await db.insert(schema.ChatMessage).values([
    {
      id: "e2e-msg-1",
      fightId: TEST_FIGHT_ID,
      senderId: TEST_USER_IDS.me,
      content: "E aí, pronto para o combate?",
      createdAt: new Date(Date.now() - 3600_000),
    },
    {
      id: "e2e-msg-2",
      fightId: TEST_FIGHT_ID,
      senderId: TEST_USER_IDS.opponent,
      content: "Sempre pronto. Nos vemos no octógono.",
      createdAt: new Date(Date.now() - 1800_000),
    },
    {
      id: "e2e-msg-3",
      fightId: TEST_FIGHT_ID,
      senderId: TEST_USER_IDS.me,
      content: "O treino hoje foi pesado. Vou descansar.",
      createdAt: new Date(Date.now() - 600_000),
    },
  ]);

  // Sessão do usuário logado
  const sessionToken = randomUUID();
  await db.insert(schema.session).values({
    id: randomUUID(),
    token: sessionToken,
    userId: TEST_USER_IDS.me,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  });

  const cookieValue = signSessionToken(sessionToken, secret);

  return NextResponse.json({
    ok: true,
    user: { id: TEST_USER_IDS.me, name: "Thiago Silva" },
    fightId: TEST_FIGHT_ID,
    cookieName: "better-auth.session_token",
    cookieValue,
  });
}
