import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import * as schema from '@acme/db/schema';
import { fightSchemas } from '@acme/validators';

// Workaround: Drizzle não infere nested `with: { profile: true }` para `one` dentro de `one`
// (user.profile). O runtime retorna o profile, mas o tipo não. Este cast é seguro.
interface UserWithProfile {
  id: string;
  name: string;
  image: string | null;
  profile: { nickname: string | null } | null;
}





export const fightRouter = createTRPCRouter({
  my: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

const fights = await ctx.db.query.Fight.findMany({
       where: (fight, { eq, or }) => or(
         eq(fight.fighter1Id, userId),
         eq(fight.fighter2Id, userId),
         eq(fight.judgeId, userId),
       ),
       with: {
         fighter1: { with: { profile: true } },
         fighter2: { with: { profile: true } },
         judge: { with: { profile: true } },
       },
       orderBy: (fight, { desc }) => desc(fight.updatedAt),
     });

    return fights.map((fight) => ({
      id: fight.id,
      status: fight.status,
      fighter1Id: fight.fighter1Id,
      fighter2Id: fight.fighter2Id,
      judgeId: fight.judgeId,
      location: fight.location,
      lat: fight.lat,
      lng: fight.lng,
      scheduledAt: fight.scheduledAt,
      createdAt: fight.createdAt,
      updatedAt: fight.updatedAt,
      createdById: fight.createdById,
      winnerId: fight.winnerId,
fighter1: {
         id: fight.fighter1.id,
         name: fight.fighter1.name,
         image: fight.fighter1.image,
nickname: (fight.fighter1 as unknown as UserWithProfile).profile?.nickname ?? null,
       },
fighter2: {
         id: fight.fighter2.id,
         name: fight.fighter2.name,
         image: fight.fighter2.image,
          nickname: (fight.fighter2 as unknown as UserWithProfile).profile?.nickname ?? null,
       },
judge: fight.judge
   ? {
       id: fight.judge.id,
       name: fight.judge.name,
       image: fight.judge.image,
        nickname: (fight.judge as unknown as UserWithProfile).profile?.nickname ?? null,
     }
   : null,
    }));
  }),
  byId: protectedProcedure
    .input(fightSchemas.confirm.extend({ fightId: z.string() })) // Reuse confirm schema which has fightId, but we need to change to just fightId? Actually, the input is just fightId. We'll use z.object({ fightId: z.string() }) for now, but we must use the validator. The fightSchemas.confirm has fightId, so we can use it.
    .query(async ({ ctx, input }) => {
      const { fightId } = input;
      const userId = ctx.session.user.id;

      const fight = await ctx.db.query.Fight.findFirst({
        where: (fight, { eq }) => eq(fight.id, fightId),
        with: {
          fighter1: { with: { profile: true } },
          fighter2: { with: { profile: true } },
          judge: { with: { profile: true } },
        },
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Authorization: user must be fighter1, fighter2, or judge
      if (
        fight.fighter1Id !== userId &&
        fight.fighter2Id !== userId &&
        fight.judgeId !== userId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return {
        id: fight.id,
        status: fight.status,
        fighter1Id: fight.fighter1Id,
        fighter2Id: fight.fighter2Id,
        judgeId: fight.judgeId,
        location: fight.location,
        lat: fight.lat,
        lng: fight.lng,
        scheduledAt: fight.scheduledAt,
        createdAt: fight.createdAt,
        updatedAt: fight.updatedAt,
        createdById: fight.createdById,
        winnerId: fight.winnerId,
fighter1: {
         id: fight.fighter1.id,
         name: fight.fighter1.name,
         image: fight.fighter1.image,
nickname: (fight.fighter1 as unknown as UserWithProfile).profile?.nickname ?? null,
       },
fighter2: {
         id: fight.fighter2.id,
         name: fight.fighter2.name,
         image: fight.fighter2.image,
          nickname: (fight.fighter2 as unknown as UserWithProfile).profile?.nickname ?? null,
       },
judge: fight.judge
   ? {
       id: fight.judge.id,
       name: fight.judge.name,
       image: fight.judge.image,
        nickname: (fight.judge as unknown as UserWithProfile).profile?.nickname ?? null,
     }
   : null,
      };
    }),
forJudge: protectedProcedure.query(async ({ ctx }) => {

    const fights = await ctx.db.query.Fight.findMany({
      where: (fight, { eq, and, or, isNull }) => and(
        or(
          eq(fight.status, 'pending'),
          eq(fight.status, 'scheduled')
        ),
        isNull(fight.judgeId)
      ),
      with: {
        fighter1: { with: { profile: true } },
        fighter2: { with: { profile: true } },
      },
      orderBy: (fight, { desc }) => desc(fight.createdAt),
      limit: 50,
    });

    return fights.map((fight) => ({
      id: fight.id,
      status: fight.status,
      fighter1Id: fight.fighter1Id,
      fighter2Id: fight.fighter2Id,
      judgeId: fight.judgeId,
      location: fight.location,
      lat: fight.lat,
lng: fight.lng,
       scheduledAt: fight.scheduledAt,
       createdAt: fight.createdAt,
       updatedAt: fight.updatedAt,
fighter1: {
id: fight.fighter1.id,
          name: fight.fighter1.name,
          image: fight.fighter1.image,
          nickname: (fight.fighter1 as unknown as UserWithProfile).profile?.nickname ?? null
        },
        fighter2: {
          id: fight.fighter2.id,
          name: fight.fighter2.name,
          image: fight.fighter2.image,
          nickname: (fight.fighter2 as unknown as UserWithProfile).profile?.nickname ?? null
        },
     }));
  }),
  acceptJudge: protectedProcedure
    .input(fightSchemas.acceptJudge)
    .mutation(async ({ ctx, input }) => {
      const { fightId } = input;
      const userId = ctx.session.user.id;

      // Check if the user has role judge or both
      const profile = await ctx.db.query.Profile.findFirst({
        where: (table, { eq }) => eq(table.userId, userId),
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (!(profile.role === 'judge' || profile.role === 'both')) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (!(fight.status === 'pending' || fight.status === 'scheduled')) {
        throw new TRPCError({ code: 'CONFLICT' });
      }

      if (fight.judgeId !== null) {
        if (fight.judgeId === userId) {
          // Already the judge, idempotent
          return fight;
        } else {
          // Another judge already accepted
          throw new TRPCError({ code: 'CONFLICT' });
        }
      }

      // Accept the judge role
      const [updatedFight] = await ctx.db
        .update(schema.Fight)
        .set({
          judgeId: userId,
          updatedAt: new Date(),
        })
        .where(eq(schema.Fight.id, fightId))
        .returning();

      return updatedFight;
    }),
  propose: protectedProcedure
    .input(fightSchemas.propose.safeExtend({ fightId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { fightId, location, lat, lng, scheduledAt } = input;
      const userId = ctx.session.user.id;

      // Check if the user is fighter1 or fighter2 of the fight
      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (fight.fighter1Id !== userId && fight.fighter2Id !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      if (fight.status !== 'pending') {
        throw new TRPCError({ code: 'CONFLICT' });
      }

      // Update the fight with the proposal details
      const [updatedFight] = await ctx.db
        .update(schema.Fight)
        .set({
          location,
          lat,
          lng,
          scheduledAt: new Date(scheduledAt), // Convert string to Date
          createdById: userId,
          updatedAt: new Date(),
        })
        .where(eq(schema.Fight.id, fightId))
        .returning();

      return updatedFight;
    }),
  confirm: protectedProcedure
    .input(fightSchemas.confirm)
    .mutation(async ({ ctx, input }) => {
      const { fightId } = input;
      const userId = ctx.session.user.id;

      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Check if the user is fighter1 or fighter2
      if (fight.fighter1Id !== userId && fight.fighter2Id !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      if (fight.status !== 'pending') {
        throw new TRPCError({ code: 'CONFLICT' });
      }

      // The user must not be the one who created the fight (createdById)
      if (fight.createdById === userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Confirm the fight: set status to scheduled
      const [updatedFight] = await ctx.db
        .update(schema.Fight)
        .set({
          status: 'scheduled',
          updatedAt: new Date(),
        })
        .where(eq(schema.Fight.id, fightId))
        .returning();

      return updatedFight;
    }),
  complete: protectedProcedure
    .input(fightSchemas.complete)
    .mutation(async ({ ctx, input }) => {
      const { fightId, winnerId } = input;
      const userId = ctx.session.user.id;

      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Check if the user is fighter1, fighter2, or judge
      if (
        fight.fighter1Id !== userId &&
        fight.fighter2Id !== userId &&
        fight.judgeId !== userId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      if (fight.status !== 'scheduled') {
        throw new TRPCError({ code: 'CONFLICT' });
      }

      // Check if the winner is one of the fighters
      if (winnerId !== fight.fighter1Id && winnerId !== fight.fighter2Id) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      // Complete the fight
      const [updatedFight] = await ctx.db
        .update(schema.Fight)
        .set({
          winnerId,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(schema.Fight.id, fightId))
        .returning();

      return updatedFight;
    }),
  cancel: protectedProcedure
    .input(fightSchemas.cancel)
    .mutation(async ({ ctx, input }) => {
      const { fightId } = input;
      const userId = ctx.session.user.id;

      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Check if the user is fighter1, fighter2, or judge
      if (
        fight.fighter1Id !== userId &&
        fight.fighter2Id !== userId &&
        fight.judgeId !== userId
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      if (!(fight.status === 'pending' || fight.status === 'scheduled')) {
        throw new TRPCError({ code: 'CONFLICT' });
      }

      // Cancel the fight
      const [updatedFight] = await ctx.db
        .update(schema.Fight)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(schema.Fight.id, fightId))
        .returning();

      return updatedFight;
    })
});