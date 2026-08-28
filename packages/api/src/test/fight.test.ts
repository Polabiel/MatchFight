import { beforeAll, describe, expect, it } from "vitest";

import { db as testDb } from "@acme/db/test";

import { createTestCaller, createTestUser, runTestMigrations } from "./helpers";

describe("Fight Router", () => {
  beforeAll(async () => {
    await runTestMigrations();
  });

  it("should allow proposer to propose a fight", async () => {
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

    // A proposes the fight
    await callerA.fight.propose({
      fightId,
      location: "Test Location",
      lat: 0,
      lng: 0,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    });

    // Check that the fight status is still pending (proposal doesn't change status)
    const fight = await testDb.query.Fight.findFirst({
      where: (table, { eq }) => eq(table.id, fightId),
    });
    expect(fight).toMatchObject({
      id: fightId,
      status: "pending",
      location: "Test Location",
      lat: 0,
      lng: 0,
      scheduledAt: expect.any(Date),
      createdById: userIdA,
    });
  });

  // Test for 'my' procedure
  it("my: returns fights where the user is fighter1, fighter2, or judge", async () => {
    // Create three users: A (fighter), B (fighter), C (judge)
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: "FighterA", role: "fighter" },
    });
    const { userId: userIdB } = await createTestUser({
      profile: { nickname: "FighterB", role: "fighter" },
    });
    const { userId: userIdC } = await createTestUser({
      profile: { nickname: "JudgeC", role: "judge" },
    });

    const callerA = createTestCaller(userIdA);
    const callerB = createTestCaller(userIdB);
    const callerC = createTestCaller(userIdC);

    // Create a fight between A and B (mutual like)
    await callerA.swipe.like({ targetId: userIdB });
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    const fightId = likeBA.fightId!;

    // Caller A (fighter1) should see the fight in my
    const myFightsA = await callerA.fight.my();
    expect(myFightsA).toHaveLength(1);
    const fightA = myFightsA[0]!;
    expect(fightA.id).toBe(fightId);
    expect([fightA.fighter1Id, fightA.fighter2Id]).toContain(userIdA);
    expect([fightA.fighter1Id, fightA.fighter2Id]).toContain(userIdB);
    expect(fightA.judgeId).toBeNull();

    // Caller B (fighter2) should see the fight in my
    const myFightsB = await callerB.fight.my();
    expect(myFightsB).toHaveLength(1);
    const fightB = myFightsB[0]!;
    expect(fightB.id).toBe(fightId);
    expect([fightB.fighter1Id, fightB.fighter2Id]).toContain(userIdA);
    expect([fightB.fighter1Id, fightB.fighter2Id]).toContain(userIdB);
    expect(fightB.judgeId).toBeNull();

    // Caller C (judge) should NOT see the fight in my because judgeId is null (not assigned yet)
    const myFightsC = await callerC.fight.my();
    expect(myFightsC).toHaveLength(0);

    // Now assign C as judge via acceptJudge (but we need to make sure the fight is pending or scheduled)
    // First, let's propose the fight from A
    await callerA.fight.propose({
      fightId,
      location: "Test Location",
      lat: 0,
      lng: 0,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Now accept judge by C
    await callerC.fight.acceptJudge({ fightId });

    // Now caller C should see the fight in my
    const myFightsCAfter = await callerC.fight.my();
    expect(myFightsCAfter).toHaveLength(1);
    const fightC = myFightsCAfter[0]!;
    expect(fightC.id).toBe(fightId);
    expect([fightC.fighter1Id, fightC.fighter2Id]).toContain(userIdA);
    expect([fightC.fighter1Id, fightC.fighter2Id]).toContain(userIdB);
    expect(fightC.judgeId).toBe(userIdC);
  });

  // Test for 'byId' procedure
  describe("byId", () => {
    it("happy path: returns the fight with fighter1/fighter2 objects including nickname", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Caller A fetches the fight byId
      const fight = await callerA.fight.byId({ fightId });

      // Check the returned fight
      expect(fight.id).toBe(fightId);
      expect([fight.fighter1Id, fight.fighter2Id]).toEqual(
        expect.arrayContaining([userIdA, userIdB]),
      );
      expect(fight.fighter1.nickname).toBeDefined();
      expect(fight.fighter2.nickname).toBeDefined();
      const nicknames = [fight.fighter1.nickname, fight.fighter2.nickname];
      expect(nicknames).toContain("FighterA");
      expect(nicknames).toContain("FighterB");
    });

    it("error: nonexistent fightId → NOT_FOUND", async () => {
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const callerA = createTestCaller(userIdA);

      const fakeFightId = "00000000-0000-0000-0000-000000000000";

      await expect(
        callerA.fight.byId({ fightId: fakeFightId }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("error: random third user calling byId → FORBIDDEN", async () => {
      // Create two fighters A and B, and a third user C
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });
      const { userId: userIdC } = await createTestUser({
        profile: { nickname: "UserC", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);
      const callerC = createTestCaller(userIdC);

      // Create fight between A and B
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Caller C (not participant) tries to fetch the fight
      await expect(callerC.fight.byId({ fightId })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  // Test for 'forJudge' procedure
  it("forJudge: returns pending fights with judgeId null, with fighter1/fighter2 nickname populated", async () => {
    // Create a judge user
    const { userId: userIdJudge } = await createTestUser({
      profile: { nickname: "JudgeJ", role: "judge" },
    });
    const callerJudge = createTestCaller(userIdJudge);

    // Create two fighters
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: "FighterA", role: "fighter" },
    });
    const { userId: userIdB } = await createTestUser({
      profile: { nickname: "FighterB", role: "fighter" },
    });

    const callerA = createTestCaller(userIdA);
    const callerB = createTestCaller(userIdB);

    // Create a fight between A and B (mutual like)
    await callerA.swipe.like({ targetId: userIdB });
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    const fightId = likeBA.fightId!;

    // At this point, fight is pending and judgeId is null
    // Call forJudge as the judge user
    const judgeFights = await callerJudge.fight.forJudge();

    // Expect to see the fight in the list (by fightId)
    const fight = judgeFights.find((f) => f.id === fightId)!;
    expect(fight).toBeDefined();
    expect(fight).toMatchObject({
      id: fightId,
      status: "pending",
      judgeId: null,
      fighter1: {
        nickname: expect.any(String),
      },
      fighter2: {
        nickname: expect.any(String),
      },
    });
    // Additionally, check that the nicknames are the ones we set
    const nicknames = [fight.fighter1.nickname, fight.fighter2.nickname];
    expect(nicknames).toContain("FighterA");
    expect(nicknames).toContain("FighterB");
  });

  // Test for 'acceptJudge' procedure
  describe("acceptJudge", () => {
    it("judge user accepts: fight.judgeId === judge userId", async () => {
      // Create a judge user
      const { userId: userIdJudge } = await createTestUser({
        profile: { nickname: "JudgeJ", role: "judge" },
      });
      const callerJudge = createTestCaller(userIdJudge);

      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Judge accepts the fight
      await callerJudge.fight.acceptJudge({ fightId });

      // Fetch the fight to verify judgeId is set
      const fight = await testDb.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });
      expect(fight).toMatchObject({
        id: fightId,
        judgeId: userIdJudge,
      });
    });

    it("error: SECOND judge accepting the same fight → CONFLICT", async () => {
      // Create two judge users
      const { userId: userIdJudge1 } = await createTestUser({
        profile: { nickname: "Judge1", role: "judge" },
      });
      const { userId: userIdJudge2 } = await createTestUser({
        profile: { nickname: "Judge2", role: "judge" },
      });
      const callerJudge1 = createTestCaller(userIdJudge1);
      const callerJudge2 = createTestCaller(userIdJudge2);

      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // First judge accepts
      await callerJudge1.fight.acceptJudge({ fightId });

      // Second judge tries to accept -> should conflict
      await expect(
        callerJudge2.fight.acceptJudge({ fightId }),
      ).rejects.toMatchObject({
        code: "CONFLICT",
      });
    });

    it("error: A fighter (non-judge profile) accepting → FORBIDDEN", async () => {
      // Create a fighter user (not judge)
      const { userId: userIdFighter } = await createTestUser({
        profile: { nickname: "FighterF", role: "fighter" },
      });
      const callerFighter = createTestCaller(userIdFighter);

      // Create two other fighters for the fight
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like between A and B
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // FighterF tries to accept judge -> forbidden
      await expect(
        callerFighter.fight.acceptJudge({ fightId }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  // Test for 'confirm' procedure
  describe("confirm", () => {
    it("the OTHER fighter (who did NOT create the proposal) confirms: status becomes scheduled", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A proposes the fight (createdById = A)
      await callerA.fight.propose({
        fightId,
        location: "Test Location",
        lat: 0,
        lng: 0,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Fighter B confirms (the other fighter)
      await callerB.fight.confirm({ fightId });

      // Check fight status is now scheduled
      const fight = await testDb.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });
      expect(fight).toMatchObject({
        id: fightId,
        status: "scheduled",
      });
    });

    it("error: proposer (createdById) confirming → FORBIDDEN", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A proposes the fight (createdById = A)
      await callerA.fight.propose({
        fightId,
        location: "Test Location",
        lat: 0,
        lng: 0,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Fighter A tries to confirm -> forbidden
      await expect(callerA.fight.confirm({ fightId })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("error: a user not in the fight → FORBIDDEN", async () => {
      // Create two fighters for the fight
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      // Create a third user not in the fight
      const { userId: userIdC } = await createTestUser({
        profile: { nickname: "UserC", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);
      const callerC = createTestCaller(userIdC);

      // Create fight via mutual like between A and B
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A proposes the fight
      await callerA.fight.propose({
        fightId,
        location: "Test Location",
        lat: 0,
        lng: 0,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // User C tries to confirm -> forbidden
      await expect(callerC.fight.confirm({ fightId })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  // Test for 'complete' procedure
  describe("complete", () => {
    it("after confirm, a participant calls complete: status completed, winnerId set", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A proposes the fight
      await callerA.fight.propose({
        fightId,
        location: "Test Location",
        lat: 0,
        lng: 0,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Fighter B confirms
      await callerB.fight.confirm({ fightId });

      // Fighter A completes the fight and declares B as winner
      await callerA.fight.complete({
        fightId,
        winnerId: userIdB,
      });

      // Check fight status is completed and winnerId is set
      const fight = await testDb.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });
      expect(fight).toMatchObject({
        id: fightId,
        status: "completed",
        winnerId: userIdB,
      });
    });

    it("error: winnerId not a fighter → BAD_REQUEST", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      // Create a third user who is not a fighter in this fight
      const { userId: userIdC } = await createTestUser({
        profile: { nickname: "UserC", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A proposes the fight
      await callerA.fight.propose({
        fightId,
        location: "Test Location",
        lat: 0,
        lng: 0,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Fighter B confirms
      await callerB.fight.confirm({ fightId });

      // Fighter A tries to complete with winnerId = userIdC (not a fighter in the fight)
      await expect(
        callerA.fight.complete({
          fightId,
          winnerId: userIdC,
        }),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });
  });

  // Test for 'cancel' procedure
  describe("cancel", () => {
    it("a participant cancels a pending fight → status cancelled", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A cancels the fight (while pending)
      await callerA.fight.cancel({ fightId });

      // Check fight status is cancelled
      const fight = await testDb.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });
      expect(fight).toMatchObject({
        id: fightId,
        status: "cancelled",
      });
    });

    it("error: cancelling an already-completed fight → CONFLICT", async () => {
      // Create two fighters
      const { userId: userIdA } = await createTestUser({
        profile: { nickname: "FighterA", role: "fighter" },
      });
      const { userId: userIdB } = await createTestUser({
        profile: { nickname: "FighterB", role: "fighter" },
      });

      const callerA = createTestCaller(userIdA);
      const callerB = createTestCaller(userIdB);

      // Create fight via mutual like
      await callerA.swipe.like({ targetId: userIdB });
      const likeBA = await callerB.swipe.like({ targetId: userIdA });
      const fightId = likeBA.fightId!;

      // Fighter A proposes the fight
      await callerA.fight.propose({
        fightId,
        location: "Test Location",
        lat: 0,
        lng: 0,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Fighter B confirms
      await callerB.fight.confirm({ fightId });

      // Fighter A completes the fight
      await callerA.fight.complete({
        fightId,
        winnerId: userIdB,
      });

      // Now try to cancel the completed fight -> conflict
      await expect(callerA.fight.cancel({ fightId })).rejects.toMatchObject({
        code: "CONFLICT",
      });
    });
  });
});
