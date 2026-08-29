import { randomUUID } from "node:crypto";

import type { Auth } from "@acme/auth";
import * as schema from "@acme/db/schema";
import { runMigrations, db as testDb } from "@acme/db/test";

import { appRouter } from "../root";

export const createTestUser = async (
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean | null;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    profile?: Pick<typeof schema.Profile.$inferInsert, "nickname" | "role"> &
      Partial<
        Omit<
          typeof schema.Profile.$inferInsert,
          "nickname" | "role" | "id" | "userId"
        >
      >;
  }> = {},
) => {
  const id = overrides.id ?? randomUUID();
  const name = overrides.name ?? `Test User ${id}`;
  const email = overrides.email ?? `test_${id}@example.com`;
  const emailVerified = overrides.emailVerified ?? true;
  const createdAt = overrides.createdAt ?? new Date();
  const updatedAt = overrides.updatedAt ?? new Date();

  // Insert user
  await testDb.insert(schema.user).values({
    id,
    name,
    email,
    emailVerified,
    createdAt,
    updatedAt,
    image:
      overrides.image !== undefined
        ? overrides.image
        : "https://example.com/avatar.png",
  });

  let profileId: string | undefined;
  if (overrides.profile) {
    const profileData = {
      userId: id,
      ...overrides.profile,
    };
    if (!("bio" in profileData)) {
      profileData.bio = "Test bio";
    }
    const [profile] = await testDb
      .insert(schema.Profile)
      .values(profileData)
      .returning();
    profileId = profile?.id;
  }

  return { userId: id, profileId };
};

export const createTestCaller = (
  userId: string,
): ReturnType<typeof appRouter.createCaller> => {
  const session = {
    session: {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      token: "test-token",
      ipAddress: null,
      userAgent: null,
    },
    user: {
      id: userId,
      name: "T",
      email: "t@t.com",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const authApi = {
    getSession: () => Promise.resolve(session),
  } as unknown as Auth["api"];

  // Create a context function that returns the fake context
  const createContext = () => ({
    db: testDb,
    authApi,
    session,
  });

  return appRouter.createCaller(createContext);
};

export const runTestMigrations = async () => {
  await runMigrations();
};
