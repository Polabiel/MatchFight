import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull, isNull, not, or } from "drizzle-orm";
import { z } from "zod";

import * as schema from "@acme/db/schema";
import { swipeSchemas } from "@acme/validators";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const swipeRouter = createTRPCRouter({
  candidates: protectedProcedure
    .input(
      z.object({
        weightClass: z
          .enum([
            "flyweight",
            "bantamweight",
            "featherweight",
            "lightweight",
            "welterweight",
            "middleweight",
            "light_heavyweight",
            "heavyweight",
          ])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const weightClass = input.weightClass;

      const conditions = [
        not(eq(schema.Profile.userId, userId)), // exclude self
        or(eq(schema.Profile.role, "fighter"), eq(schema.Profile.role, "both")), // role fighter or both
        // Exclude users we have already swiped (any choice)
        isNull(
          ctx.db
            .select({ id: schema.Swipe.id })
            .from(schema.Swipe)
            .where(
              and(
                eq(schema.Swipe.swiperId, userId),
                eq(schema.Swipe.targetId, schema.Profile.userId),
              ),
            )
            .limit(1),
        ),
        // Exclude users who are in an active fight with us (status pending or scheduled)
        isNull(
          ctx.db
            .select({ id: schema.Fight.id })
            .from(schema.Fight)
            .where(
              and(
                or(
                  eq(schema.Fight.fighter1Id, userId),
                  eq(schema.Fight.fighter2Id, userId),
                ),
                or(
                  eq(schema.Fight.fighter1Id, schema.Profile.userId),
                  eq(schema.Fight.fighter2Id, schema.Profile.userId),
                ),
                or(
                  eq(schema.Fight.status, "pending"),
                  eq(schema.Fight.status, "scheduled"),
                ),
              ),
            )
            .limit(1),
        ),
        isNotNull(schema.user.image),
        isNotNull(schema.Profile.bio),
      ];

      if (weightClass !== undefined) {
        conditions.push(eq(schema.Profile.weightClass, weightClass));
      }

      const candidates = await ctx.db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          image: schema.user.image,
          nickname: schema.Profile.nickname,
          bio: schema.Profile.bio,
          weightClass: schema.Profile.weightClass,
          wins: schema.Profile.wins,
          losses: schema.Profile.losses,
          location: schema.Profile.location,
        })
        .from(schema.Profile)
        .innerJoin(schema.user, eq(schema.Profile.userId, schema.user.id))
        .where(and(...conditions))
        .orderBy(desc(schema.Profile.createdAt))
        .limit(50);

      return candidates;
    }),

  like: protectedProcedure
    .input(swipeSchemas.like)
    .mutation(async ({ ctx, input }) => {
      const { targetId } = input;
      const userId = ctx.session.user.id;

      // Cannot self-like
      if (userId === targetId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if target has a profile with role fighter or both
      const targetProfile = await ctx.db.query.Profile.findFirst({
        where: (table, { eq }) => eq(table.userId, targetId),
      });

      if (!targetProfile) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        !(targetProfile.role === "fighter" || targetProfile.role === "both")
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await ctx.db.transaction(async (tx) => {
        // Upsert the swipe (choice 'like') with onConflictDoNothing
        await tx
          .insert(schema.Swipe)
          .values({
            swiperId: userId,
            targetId: targetId,
            choice: "like",
            createdAt: new Date(),
          })
          .onConflictDoNothing({
            target: [schema.Swipe.swiperId, schema.Swipe.targetId],
          });

        // Check if there is a reciprocal like (B liked A)
        const reciprocalLike = await tx.query.Swipe.findFirst({
          where: (table, { eq }) =>
            and(
              eq(table.swiperId, targetId),
              eq(table.targetId, userId),
              eq(table.choice, "like"),
            ),
        });

        if (reciprocalLike) {
          // There is a match, check if there is already an active fight between them
          const existingFight = await tx.query.Fight.findFirst({
            where: (table, { eq }) =>
              and(
                or(eq(table.fighter1Id, userId), eq(table.fighter2Id, userId)),
                or(
                  eq(table.fighter1Id, targetId),
                  eq(table.fighter2Id, targetId),
                ),
                or(eq(table.status, "pending"), eq(table.status, "scheduled")),
              ),
          });

          if (!existingFight) {
            // Create a new fight
            const [fight] = await tx
              .insert(schema.Fight)
              .values({
                fighter1Id: userId,
                fighter2Id: targetId,
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();

            if (!fight) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            return { matched: true, fightId: fight.id };
          } else {
            // Fight already exists
            return { matched: true, fightId: existingFight.id };
          }
        } else {
          // No match
          return { matched: false, fightId: null };
        }
      });
    }),

  pass: protectedProcedure
    .input(swipeSchemas.pass)
    .mutation(async ({ ctx, input }) => {
      const { targetId } = input;
      const userId = ctx.session.user.id;

      // Cannot self-pass
      if (userId === targetId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Upsert the swipe (choice 'pass') with onConflictDoNothing
      await ctx.db
        .insert(schema.Swipe)
        .values({
          swiperId: userId,
          targetId: targetId,
          choice: "pass",
          createdAt: new Date(),
        })
        .onConflictDoNothing({
          target: [schema.Swipe.swiperId, schema.Swipe.targetId],
        });

      return { ok: true };
    }),
});
