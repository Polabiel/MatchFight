import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as schema from "./schema";
import { runMigrations, db as testDb } from "./test/db";

describe("Schema constraints", () => {
  beforeAll(async () => {
    await runMigrations();
    // O turbo roda os testes de @acme/api e @acme/db em paralelo contra o mesmo
    // banco de teste. Truncar garante estado determinístico (18 users, 0 swipes).
    await testDb.delete(schema.ChatMessage);
    await testDb.delete(schema.Swipe);
    await testDb.delete(schema.Fight);
    await testDb.delete(schema.Profile);
    await testDb.delete(schema.user);
  });

  afterAll(async () => {
    await testDb.$client.end();
  });

  it("should migrate schema cleanly", async () => {
    // We can check that the tables exist by querying the schema
    const result = await testDb.select().from(schema.user);
    // We don't expect any users yet, but the query should not throw
    expect(result).toBeInstanceOf(Array);
  });

  it("should ensure Profile.userId is unique", async () => {
    // Try to insert a duplicate userId
    const userId = "duplicate-user";
    await testDb.insert(schema.user).values({
      id: userId,
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await testDb.insert(schema.Profile).values({
      userId,
      nickname: "TestNick",
      role: "fighter",
      weightClass: "flyweight",
      wins: 0,
      losses: 0,
      location: "Test Location",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Attempt to insert another profile with the same userId should fail
    await expect(
      testDb.insert(schema.Profile).values({
        userId,
        nickname: "TestNick2",
        role: "judge",
        weightClass: undefined,
        wins: 0,
        losses: 0,
        location: "Test Location 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).rejects.toThrow();
  });

  it("should ensure Swipe has unique (swiperId, targetId) and FK cascade works", async () => {
    // Create two users
    const user1Id = "user1";
    const user2Id = "user2";
    await testDb.insert(schema.user).values([
      {
        id: user1Id,
        name: "User 1",
        email: "user1@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: user2Id,
        name: "User 2",
        email: "user2@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Insert a swipe
    await testDb.insert(schema.Swipe).values({
      swiperId: user1Id,
      targetId: user2Id,
      choice: "like",
      createdAt: new Date(),
    });

    // Attempt to insert another swipe with the same swiperId and targetId should fail
    await expect(
      testDb.insert(schema.Swipe).values({
        swiperId: user1Id,
        targetId: user2Id,
        choice: "pass",
        createdAt: new Date(),
      }),
    ).rejects.toThrow();

    // Delete user1 and verify that the swipe is deleted (cascade)
    await testDb.delete(schema.user).where(eq(schema.user.id, user1Id));

    const swipes = await testDb.select().from(schema.Swipe);
    expect(swipes).toHaveLength(0);
  });
});
