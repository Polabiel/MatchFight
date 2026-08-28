import { beforeAll, describe, expect, it } from "vitest";

import { db as testDb } from "@acme/db/test";

import { createTestCaller, createTestUser, runTestMigrations } from "./helpers";

describe("Chat Router", () => {
  beforeAll(async () => {
    await runTestMigrations();
  });

  it("should allow fighter to send a message", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    const callerA = createTestCaller(userIdA);

    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: "UserB",
        role: "fighter",
      },
    });
    const callerB = createTestCaller(userIdB);

    // A likes B
    await callerA.swipe.like({ targetId: userIdB });
    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // A sends a message
    const message = await callerA.chat.send({
      fightId,
      content: "Hello, B!",
    });

    expect(message).toMatchObject({
      id: expect.any(String),
      fightId,
      senderId: userIdA,
      content: "Hello, B!",
      createdAt: expect.any(Date),
    });

    // Check that the message is stored in the database
    const storedMessage = await testDb.query.ChatMessage.findFirst({
      where: (table, { eq }) => eq(table.id, message!.id),
    });
    expect(storedMessage).toMatchObject({
      id: storedMessage!.id,
      fightId,
      senderId: userIdA,
      content: storedMessage!.content,
    });
  });

  // Test 1: list — after A sends 2 messages, callerA.chat.list({fightId}) returns both in ascending order (oldest first)
  it("should list messages in ascending order (oldest first)", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    const callerA = createTestCaller(userIdA);

    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: "UserB",
        role: "fighter",
      },
    });
    const callerB = createTestCaller(userIdB);

    // A likes B
    await callerA.swipe.like({ targetId: userIdB });
    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // A sends first message
    const msg1 = await callerA.chat.send({
      fightId,
      content: "First message",
    });

    // Small delay to ensure distinct timestamps (if needed)
    await new Promise((resolve) => setTimeout(resolve, 5));

    // A sends second message
    const msg2 = await callerA.chat.send({
      fightId,
      content: "Second message",
    });

    // List messages
    const messages = await callerA.chat.list({ fightId });

    expect(messages).toHaveLength(2);
    // Expect ascending order: oldest first
    expect(messages[0]!.content).toBe("First message");
    expect(messages[1]!.content).toBe("Second message");
    // Verify IDs match
    expect(messages[0]!.id).toBe(msg1!.id);
    expect(messages[1]!.id).toBe(msg2!.id);
  });

  // Test 2: list limit + after — A sends 3 messages; list({fightId, limit: 2}) returns 2 (the latest 2, ascending among them); list({fightId, after: <iso of msg1.createdAt>}) excludes msg1.
  it("should support limit and after filters", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    const callerA = createTestCaller(userIdA);

    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: "UserB",
        role: "fighter",
      },
    });
    const callerB = createTestCaller(userIdB);

    // A likes B
    await callerA.swipe.like({ targetId: userIdB });
    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // A sends three messages with small delays
    const msg1 = await callerA.chat.send({
      fightId,
      content: "Message 1",
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const msg2 = await callerA.chat.send({
      fightId,
      content: "Message 2",
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const msg3 = await callerA.chat.send({
      fightId,
      content: "Message 3",
    });

    // Test limit: 2 should return the latest 2 messages (msg2 and msg3) in ascending order (msg2 then msg3)
    const limited = await callerA.chat.list({ fightId, limit: 2 });
    expect(limited).toHaveLength(2);
    expect(limited[0]!.content).toBe("Message 2");
    expect(limited[1]!.content).toBe("Message 3");
    expect(limited[0]!.id).toBe(msg2!.id);
    expect(limited[1]!.id).toBe(msg3!.id);

    // Test after: exclude msg1, should return msg2 and msg3 in ascending order
    const afterMsg1 = await callerA.chat.list({
      fightId,
      after: msg1!.createdAt.toISOString(),
    });
    expect(afterMsg1).toHaveLength(2);
    expect(afterMsg1[0]!.content).toBe("Message 2");
    expect(afterMsg1[1]!.content).toBe("Message 3");
    expect(afterMsg1[0]!.id).toBe(msg2!.id);
    expect(afterMsg1[1]!.id).toBe(msg3!.id);
  });

  // Test 3: list nonexistent fight → NOT_FOUND.
  it("should return NOT_FOUND for nonexistent fight in list", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    const callerA = createTestCaller(userIdA);

    // Attempt to list messages for a nonexistent fight (using a valid UUID that doesn't exist)
    await expect(
      callerA.chat.list({ fightId: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow(/NOT_FOUND/);
  });

  // Test 4: list by non-participant (user C) → FORBIDDEN.
  it("should return FORBIDDEN for non-participant in list", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: "UserB",
        role: "fighter",
      },
    });
    // Create user C (non-participant)
    const { userId: userIdC } = await createTestUser({
      profile: {
        nickname: "UserC",
        role: "fighter",
      },
    });

    const callerA = createTestCaller(userIdA);
    const callerB = createTestCaller(userIdB);
    const callerC = createTestCaller(userIdC);

    // A likes B
    await callerA.swipe.like({ targetId: userIdB });
    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // A sends a message to have something in the chat
    await callerA.chat.send({
      fightId,
      content: "Hello",
    });

    // User C (non-participant) tries to list messages
    await expect(callerC.chat.list({ fightId })).rejects.toThrow(/FORBIDDEN/);
  });

  // Test 5: send by non-participant (user C) → FORBIDDEN.
  it("should return FORBIDDEN for non-participant in send", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: "UserB",
        role: "fighter",
      },
    });
    // Create user C (non-participant)
    const { userId: userIdC } = await createTestUser({
      profile: {
        nickname: "UserC",
        role: "fighter",
      },
    });

    const callerA = createTestCaller(userIdA);
    const callerB = createTestCaller(userIdB);
    const callerC = createTestCaller(userIdC);

    // A likes B
    await callerA.swipe.like({ targetId: userIdB });
    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // User C (non-participant) tries to send a message
    await expect(
      callerC.chat.send({ fightId, content: "Hello" }),
    ).rejects.toThrow(/FORBIDDEN/);
  });

  // Test 6: send to nonexistent fight → NOT_FOUND.
  it("should return NOT_FOUND for nonexistent fight in send", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    const callerA = createTestCaller(userIdA);

    // Attempt to send to a nonexistent fight (using a valid UUID that doesn't exist)
    await expect(
      callerA.chat.send({
        fightId: "00000000-0000-0000-0000-000000000000",
        content: "Hello",
      }),
    ).rejects.toThrow(/NOT_FOUND/);
  });

  // Test 7: send empty content → rejects (zod min 1)
  it("should reject empty content in send", async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: "UserA",
        role: "fighter",
      },
    });
    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: "UserB",
        role: "fighter",
      },
    });
    const callerA = createTestCaller(userIdA);
    const callerB = createTestCaller(userIdB);

    // A likes B
    await callerA.swipe.like({ targetId: userIdB });
    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // Attempt to send empty content
    await expect(callerA.chat.send({ fightId, content: "" })).rejects.toThrow(); // Zod validation error
  });
});
