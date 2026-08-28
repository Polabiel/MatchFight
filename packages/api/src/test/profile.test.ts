import { describe, it, expect, beforeAll } from 'vitest';
import { runTestMigrations, createTestUser, createTestCaller } from './helpers';

describe('Profile Router', () => {
  beforeAll(async () => {
    await runTestMigrations();
  });

  it('should return null for getMe when user has no profile', async () => {
    // Create a user without a profile
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    const profile = await caller.profile.getMe();
    expect(profile).toBeNull();
  });

  it('should create a profile on update', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    const input = {
      nickname: 'TestNick',
      bio: 'Test bio',
      role: 'fighter' as const,
      weightClass: 'welterweight' as const,
      wins: 0,
      losses: 0,
      location: 'Test City',
    };

    const profile = await caller.profile.update(input);
    expect(profile).toMatchObject({
      nickname: input.nickname,
      bio: input.bio,
      role: input.role,
      weightClass: input.weightClass,
      wins: input.wins,
      losses: input.losses,
      location: input.location,
    });
  });

  it('should update an existing profile', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    // First update
    await caller.profile.update({
      nickname: 'OldNick',
      bio: 'Old bio',
      role: 'fighter' as const,
      weightClass: 'welterweight' as const,
      wins: 0,
      losses: 0,
      location: 'Old City',
    });

    // Second update
    const updatedProfile = await caller.profile.update({
      nickname: 'NewNick',
      bio: 'New bio',
      role: 'judge' as const,
      weightClass: 'middleweight' as const,
      wins: 10,
      losses: 5,
      location: 'New City',
    });

    expect(updatedProfile).toMatchObject({
      nickname: 'NewNick',
      bio: 'New bio',
      role: 'judge',
      weightClass: 'middleweight',
      wins: 10,
      losses: 5,
      location: 'New City',
    });
  });

  it('should get profile by userId', async () => {
    // Create a user and set up a profile for that user
    const { userId: targetUserId } = await createTestUser();
    const targetCaller = createTestCaller(targetUserId);
    await targetCaller.profile.update({
      nickname: 'NickP',
      bio: 'Test bio',
      role: 'fighter' as const,
      weightClass: 'welterweight' as const,
      wins: 0,
      losses: 0,
      location: 'Test City',
    });

    // Use a caller (can be same or different user) to call the public getByUser procedure
    const caller = createTestCaller(targetUserId);
    const profile = await caller.profile.getByUser({ userId: targetUserId });

    expect(profile).not.toBeNull();
    expect(profile?.nickname).toBe('NickP');
    expect(profile?.user).toMatchObject({
      id: targetUserId,
      name: expect.any(String),
    });
  });

  it('should return null for getByUser when user has no profile', async () => {
    // Create a user without a profile
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    const profile = await caller.profile.getByUser({ userId });
    expect(profile).toBeNull();
  });

  it('should getMe return the created profile with nested user', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    // Create a profile via update
    await caller.profile.update({
      nickname: 'TestNick',
      bio: 'Test bio',
      role: 'fighter' as const,
      weightClass: 'welterweight' as const,
      wins: 5,
      losses: 3,
      location: 'Test City',
    });

    const profile = await caller.profile.getMe();

    expect(profile).not.toBeNull();
    expect(profile?.nickname).toBe('TestNick');
    expect(profile?.user.id).toBe(userId);
    expect(profile?.user.name).toBe(`Test User ${userId}`);
    expect(profile?.user.image).toBeNull();
  });

  it('should reject invalid role in update', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    await expect(
      caller.profile.update({
        nickname: 'X',
        bio: 'Test bio',
        // @ts-expect-error - invalid role for testing validation
        role: 'wizard',
        weightClass: 'welterweight' as const,
        wins: 0,
        losses: 0,
        location: 'Test City',
      })
    ).rejects.toThrow();
  });

  it('should reject negative wins in update', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    await expect(
      caller.profile.update({
        nickname: 'X',
        bio: 'Test bio',
        role: 'fighter' as const,
        weightClass: 'welterweight' as const,
        wins: -1,
        losses: 0,
        location: 'Test City',
      })
    ).rejects.toThrow();
  });

  it('should reject invalid weightClass in update', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    await expect(
      caller.profile.update({
        nickname: 'X',
        bio: 'Test bio',
        role: 'fighter' as const,
        // @ts-expect-error - invalid weightClass for testing validation
        weightClass: 'superheavy',
        wins: 0,
        losses: 0,
        location: 'Test City',
      })
    ).rejects.toThrow();
  });

  it('should reject empty nickname', async () => {
    const { userId } = await createTestUser();
    const caller = createTestCaller(userId);

    await expect(
      caller.profile.update({
        nickname: '',
        bio: 'Test bio',
        role: 'fighter' as const,
        weightClass: 'welterweight' as const,
        wins: 0,
        losses: 0,
        location: 'Test City',
      })
    ).rejects.toThrow();
  });
});