import { z } from 'zod';
import { eq, and, desc, gt } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import * as schema from '@acme/db/schema';
import { chatSchemas } from '@acme/validators';

export const chatRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        fightId: z.string(),
        limit: z.number().int().positive().max(100).default(50),
        after: z.string().datetime().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fightId, limit, after } = input;
      const userId = ctx.session.user.id;

      // Check if the user is a participant in the fight
      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isParticipant =
        fight.fighter1Id === userId ||
        fight.fighter2Id === userId ||
        fight.judgeId === userId;

      if (!isParticipant) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Build the query for messages
      const conditions = [eq(schema.ChatMessage.fightId, fightId)];
      if (after !== undefined) {
        conditions.push(gt(schema.ChatMessage.createdAt, new Date(after)));
      }

      const messages = await ctx.db
        .select({
          id: schema.ChatMessage.id,
          fightId: schema.ChatMessage.fightId,
          senderId: schema.ChatMessage.senderId,
          content: schema.ChatMessage.content,
          createdAt: schema.ChatMessage.createdAt,
        })
        .from(schema.ChatMessage)
        .where(and(...conditions))
        .orderBy(desc(schema.ChatMessage.createdAt))
        .limit(limit);

      // We want to return messages in ascending order (oldest first) for the client
      // But we queried in descending order to get the latest messages efficiently.
      // We'll reverse the array to get ascending order.
      return messages.reverse();
    }),

  send: protectedProcedure
    .input(chatSchemas.sendMessage)
    .mutation(async ({ ctx, input }) => {
      const { fightId, content } = input;
      const userId = ctx.session.user.id;

      // Check if the user is a participant in the fight
      const fight = await ctx.db.query.Fight.findFirst({
        where: (table, { eq }) => eq(table.id, fightId),
      });

      if (!fight) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isParticipant =
        fight.fighter1Id === userId ||
        fight.fighter2Id === userId ||
        fight.judgeId === userId;

      if (!isParticipant) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Insert the message
      const [message] = await ctx.db
        .insert(schema.ChatMessage)
        .values({
          fightId,
          senderId: userId,
          content,
          createdAt: new Date(),
        })
        .returning();

      return message;
    }),
});