import { describe, it, expect, beforeAll } from 'vitest';
import { runTestMigrations, createTestUser, createTestCaller } from './helpers';
import { db as testDb } from '@acme/db/test';

describe('Swipe Router', () => {
  beforeAll(async () => {
    await runTestMigrations();
  });

  it('should create a match when likes are mutual', async () => {
    // Create user A
    const { userId: userIdA } = await createTestUser({
      profile: {
        nickname: 'UserA',
        role: 'fighter',
      },
    });
    const callerA = createTestCaller(userIdA);

    // Create user B
    const { userId: userIdB } = await createTestUser({
      profile: {
        nickname: 'UserB',
        role: 'fighter',
      },
    });
    const callerB = createTestCaller(userIdB);

    // A likes B
    const likeAB = await callerA.swipe.like({ targetId: userIdB });
    expect(likeAB).toEqual({ matched: false, fightId: null });

    // B likes A
    const likeBA = await callerB.swipe.like({ targetId: userIdA });
    expect(likeBA).toMatchObject({
      matched: true,
      fightId: expect.any(String),
    });
    const fightId = likeBA.fightId!;

    // Check that there is exactly one fight with status pending
    const fight = await testDb.query.Fight.findFirst({
      where: (table, { eq }) => eq(table.id, fightId),
    });

    expect(fight).toMatchObject({
      id: fightId,
      status: 'pending',
      fighter1Id: expect.any(String),
      fighter2Id: expect.any(String),
    });
  });

  it('should return candidates excluding self and already-swiped users, and support weight class filter', async () => {
    // Create user A (fighter)
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: 'FighterA', role: 'fighter' },
    });
    const callerA = createTestCaller(userIdA);

    // Create user B (fighter, no weight class)
    const { userId: userIdB } = await createTestUser({
      profile: { nickname: 'FighterB', role: 'fighter' },
    });

    // Create user C (fighter, heavyweight)
    const { userId: userIdC } = await createTestUser({
      profile: { nickname: 'FighterC', role: 'fighter', weightClass: 'heavyweight' },
    });

    // A's candidates should include B and C, exclude A
    const candidates = await callerA.swipe.candidates({});
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    const candidateIds = candidates.map((c) => c.id);
    expect(candidateIds).toContain(userIdB);
    expect(candidateIds).toContain(userIdC);
    expect(candidateIds).not.toContain(userIdA);

    // A likes B — B should no longer be in candidates
    await callerA.swipe.like({ targetId: userIdB });
    const candidatesAfterLike = await callerA.swipe.candidates({});
    const afterLikeIds = candidatesAfterLike.map((c) => c.id);
    expect(afterLikeIds).not.toContain(userIdB);
    expect(afterLikeIds).toContain(userIdC);

    // Filter by weight class: only C (heavyweight) should appear; A and B should not
    const heavyCandidates = await callerA.swipe.candidates({ weightClass: 'heavyweight' });
    const heavyIds = heavyCandidates.map((c) => c.id);
    expect(heavyIds).toContain(userIdC);
    expect(heavyIds).not.toContain(userIdA);
    expect(heavyIds).not.toContain(userIdB);
  });

  it('should exclude users in active fights from candidates', async () => {
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: 'ActiveA', role: 'fighter' },
    });
    const { userId: userIdB } = await createTestUser({
      profile: { nickname: 'ActiveB', role: 'fighter' },
    });
    const callerA = createTestCaller(userIdA);
    const callerB = createTestCaller(userIdB);

    // A and B like each other → fight created (pending)
    await callerA.swipe.like({ targetId: userIdB });
    await callerB.swipe.like({ targetId: userIdA });

    // A's candidates should NOT include B anymore
    const candidates = await callerA.swipe.candidates({});
    const ids = candidates.map((c) => c.id);
    expect(ids).not.toContain(userIdB);
  });

  it('should reject self-like', async () => {
    const { userId } = await createTestUser({
      profile: { nickname: 'Self', role: 'fighter' },
    });
    const caller = createTestCaller(userId);

    await expect(caller.swipe.like({ targetId: userId })).rejects.toThrow();
  });

  it('should reject like on target without profile', async () => {
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: 'A', role: 'fighter' },
    });
    const { userId: userIdB } = await createTestUser(); // no profile
    const callerA = createTestCaller(userIdA);

    await expect(callerA.swipe.like({ targetId: userIdB })).rejects.toThrow();
  });

  it('should reject like on target with role judge only', async () => {
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: 'A', role: 'fighter' },
    });
    const { userId: userIdJudge } = await createTestUser({
      profile: { nickname: 'Judge', role: 'judge' },
    });
    const callerA = createTestCaller(userIdA);

    await expect(callerA.swipe.like({ targetId: userIdJudge })).rejects.toThrow();
  });

  it('should record a pass and exclude from candidates, not create a fight', async () => {
    const { userId: userIdA } = await createTestUser({
      profile: { nickname: 'A', role: 'fighter' },
    });
    const { userId: userIdB } = await createTestUser({
      profile: { nickname: 'B', role: 'fighter' },
    });
    const callerA = createTestCaller(userIdA);

    // A passes on B
    const result = await callerA.swipe.pass({ targetId: userIdB });
    expect(result).toEqual({ ok: true });

    // Verify no fight exists between A and B
    const fights = await testDb.query.Fight.findMany({
      where: (table, { eq, or }) =>
        or(
          eq(table.fighter1Id, userIdA),
          eq(table.fighter2Id, userIdA),
        ),
    });
    const fightWithB = fights.find(
      (f) => f.fighter1Id === userIdB || f.fighter2Id === userIdB,
    );
    expect(fightWithB).toBeUndefined();

    // Verify B is excluded from A's candidates
    const candidates = await callerA.swipe.candidates({});
    const ids = candidates.map((c) => c.id);
    expect(ids).not.toContain(userIdB);
  });
});