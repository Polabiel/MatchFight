import { describe, expect, test } from "vitest";
import {
  profileSchemas,
  swipeSchemas,
  fightSchemas,
  chatSchemas,
} from "./index";

describe("profileSchemas", () => {
  describe("createProfile", () => {
    test("accepts valid input", () => {
      const input = {
        nickname: "Nick",
        bio: "Bio",
        role: "fighter",
        weightClass: "lightweight",
        wins: 10,
        losses: 5,
        location: "City",
      };
      expect(profileSchemas.createProfile.parse(input)).toEqual(input);
    });

    test("rejects empty nickname", () => {
      expect(() =>
        profileSchemas.createProfile.parse({
          nickname: "",
          bio: "Bio",
          role: "fighter",
          weightClass: "lightweight",
          wins: 10,
          losses: 5,
          location: "City",
        })
      ).toThrow();
    });

    test("rejects nickname with 65 chars", () => {
      expect(() =>
        profileSchemas.createProfile.parse({
          nickname: "a".repeat(65),
          bio: "Bio",
          role: "fighter",
          weightClass: "lightweight",
          wins: 10,
          losses: 5,
          location: "City",
        })
      ).toThrow();
    });

    test("rejects invalid role", () => {
      expect(() =>
        profileSchemas.createProfile.parse({
          nickname: "Nick",
          bio: "Bio",
          role: "invalid",
          weightClass: "lightweight",
          wins: 10,
          losses: 5,
          location: "City",
        })
      ).toThrow();
    });

    test("rejects invalid weightClass", () => {
      expect(() =>
        profileSchemas.createProfile.parse({
          nickname: "Nick",
          bio: "Bio",
          role: "fighter",
          weightClass: "invalid",
          wins: 10,
          losses: 5,
          location: "City",
        })
      ).toThrow();
    });

    test("rejects negative wins", () => {
      expect(() =>
        profileSchemas.createProfile.parse({
          nickname: "Nick",
          bio: "Bio",
          role: "fighter",
          weightClass: "lightweight",
          wins: -1,
          losses: 5,
          location: "City",
        })
      ).toThrow();
    });
  });

  describe("updateProfile", () => {
    test("accepts valid partial input", () => {
      const input = { nickname: "NewNick" };
      const parsed = profileSchemas.updateProfile.parse(input);
      expect(parsed.nickname).toBe("NewNick");
      expect(parsed.wins).toBe(0);
      expect(parsed.losses).toBe(0);
      expect(parsed.bio).toBeUndefined();
      expect(parsed.role).toBeUndefined();
      expect(parsed.weightClass).toBeUndefined();
      expect(parsed.location).toBeUndefined();
    });

    test("rejects empty nickname when provided", () => {
      expect(() =>
        profileSchemas.updateProfile.parse({
          nickname: "",
        })
      ).toThrow();
    });

    test("rejects invalid role when provided", () => {
      expect(() =>
        profileSchemas.updateProfile.parse({
          role: "invalid",
        })
      ).toThrow();
    });
  });
});

describe("swipeSchemas", () => {
  describe("like", () => {
    test("accepts valid targetId", () => {
      const input = { targetId: "valid-id" };
      expect(swipeSchemas.like.parse(input)).toEqual(input);
    });

    test("rejects missing targetId", () => {
      expect(() => swipeSchemas.like.parse({})).toThrow();
    });

    test("rejects invalid uuid? Actually targetId is TEXT, not uuid, so we only check length", () => {
      // We are not validating uuid, just string length 1-64
      expect(() => swipeSchemas.like.parse({ targetId: "" })).toThrow();
      expect(() => swipeSchemas.like.parse({ targetId: "a".repeat(65) })).toThrow();
    });
  });

  describe("pass", () => {
    test("accepts valid targetId", () => {
      const input = { targetId: "valid-id" };
      expect(swipeSchemas.pass.parse(input)).toEqual(input);
    });

    test("rejects missing targetId", () => {
      expect(() => swipeSchemas.pass.parse({})).toThrow();
    });

    test("rejects empty targetId", () => {
      expect(() => swipeSchemas.pass.parse({ targetId: "" })).toThrow();
    });

    test("rejects targetId with 65 chars", () => {
      expect(() =>
        swipeSchemas.pass.parse({ targetId: "a".repeat(65) })
      ).toThrow();
    });
  });
});

describe("fightSchemas", () => {
  describe("propose", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // tomorrow
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // yesterday

    test("accepts valid input with location and lat/lng", () => {
      const input = {
        location: "Arena",
        lat: 12.34,
        lng: 56.78,
        scheduledAt: futureDate,
      };
      expect(fightSchemas.propose.parse(input)).toEqual(input);
    });

    test("accepts valid input without lat/lng", () => {
      const input = {
        location: "Arena",
        scheduledAt: futureDate,
      };
      expect(fightSchemas.propose.parse(input)).toEqual(input);
    });

    test("rejects scheduledAt in the past", () => {
      expect(() =>
        fightSchemas.propose.parse({
          location: "Arena",
          scheduledAt: pastDate,
        })
      ).toThrow();
    });

    test("rejects empty location", () => {
      expect(() =>
        fightSchemas.propose.parse({
          location: "",
          scheduledAt: futureDate,
        })
      ).toThrow();
    });

    test("rejects location with 257 chars", () => {
      expect(() =>
        fightSchemas.propose.parse({
          location: "a".repeat(257),
          scheduledAt: futureDate,
        })
      ).toThrow();
    });

    test("rejects lat without lng", () => {
      expect(() =>
        fightSchemas.propose.parse({
          location: "Arena",
          lat: 12.34,
          scheduledAt: futureDate,
        })
      ).toThrow();
    });

    test("rejects lng without lat", () => {
      expect(() =>
        fightSchemas.propose.parse({
          location: "Arena",
          lng: 56.78,
          scheduledAt: futureDate,
        })
      ).toThrow();
    });
  });

  describe("confirm", () => {
    test("accepts valid fightId (uuid)", () => {
      const input = { fightId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(fightSchemas.confirm.parse(input)).toEqual(input);
    });

    test("rejects missing fightId", () => {
      expect(() => fightSchemas.confirm.parse({})).toThrow();
    });

    test("rejects invalid uuid", () => {
      expect(() =>
        fightSchemas.confirm.parse({ fightId: "not-a-uuid" })
      ).toThrow();
    });
  });

  describe("acceptJudge", () => {
    test("accepts valid fightId (uuid)", () => {
      const input = { fightId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(fightSchemas.acceptJudge.parse(input)).toEqual(input);
    });

    test("rejects missing fightId", () => {
      expect(() => fightSchemas.acceptJudge.parse({})).toThrow();
    });

    test("rejects invalid uuid", () => {
      expect(() =>
        fightSchemas.acceptJudge.parse({ fightId: "not-a-uuid" })
      ).toThrow();
    });
  });

  describe("complete", () => {
    test("accepts valid input", () => {
      const input = {
        fightId: "123e4567-e89b-12d3-a456-426614174000",
        winnerId: "winner-id",
      };
      expect(fightSchemas.complete.parse(input)).toEqual(input);
    });

    test("rejects missing fightId", () => {
      expect(() =>
        fightSchemas.complete.parse({ winnerId: "winner-id" })
      ).toThrow();
    });

    test("rejects missing winnerId", () => {
      expect(() =>
        fightSchemas.complete.parse({
          fightId: "123e4567-e89b-12d3-a456-426614174000",
        })
      ).toThrow();
    });

    test("rejects invalid fightId (not uuid)", () => {
      expect(() =>
        fightSchemas.complete.parse({
          fightId: "not-a-uuid",
          winnerId: "winner-id",
        })
      ).toThrow();
    });

    test("rejects empty winnerId", () => {
      expect(() =>
        fightSchemas.complete.parse({
          fightId: "123e4567-e89b-12d3-a456-426614174000",
          winnerId: "",
        })
      ).toThrow();
    });

    test("rejects winnerId with 65 chars", () => {
      expect(() =>
        fightSchemas.complete.parse({
          fightId: "123e4567-e89b-12d3-a456-426614174000",
          winnerId: "a".repeat(65),
        })
      ).toThrow();
    });
  });

  describe("cancel", () => {
    test("accepts valid fightId (uuid)", () => {
      const input = { fightId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(fightSchemas.cancel.parse(input)).toEqual(input);
    });

    test("rejects missing fightId", () => {
      expect(() => fightSchemas.cancel.parse({})).toThrow();
    });

    test("rejects invalid uuid", () => {
      expect(() =>
        fightSchemas.cancel.parse({ fightId: "not-a-uuid" })
      ).toThrow();
    });
  });
});

describe("chatSchemas", () => {
  describe("sendMessage", () => {
    test("accepts valid input", () => {
      const input = {
        fightId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Hello",
      };
      expect(chatSchemas.sendMessage.parse(input)).toEqual(input);
    });

    test("rejects missing fightId", () => {
      expect(() =>
        chatSchemas.sendMessage.parse({ content: "Hello" })
      ).toThrow();
    });

    test("rejects missing content", () => {
      expect(() =>
        chatSchemas.sendMessage.parse({
          fightId: "123e4567-e89b-12d3-a456-426614174000",
        })
      ).toThrow();
    });

    test("rejects empty content", () => {
      expect(() =>
        chatSchemas.sendMessage.parse({
          fightId: "123e4567-e89b-12d3-a456-426614174000",
          content: "",
        })
      ).toThrow();
    });

    test("rejects content with 2001 chars", () => {
      expect(() =>
        chatSchemas.sendMessage.parse({
          fightId: "123e4567-e89b-12d3-a456-426614174000",
          content: "a".repeat(2001),
        })
      ).toThrow();
    });
  });
});