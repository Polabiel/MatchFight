import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import * as schema from "@acme/db/schema";
import { profileSchemas } from "@acme/validators";

import { validateLocation } from "../lib/geocode";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const profileRouter = createTRPCRouter({
  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const profile = await ctx.db.query.Profile.findFirst({
        where: (table, { eq }) => eq(table.userId, userId),
      });
      if (!profile) {
        return null;
      }
      const user = await ctx.db.query.user.findFirst({
        where: (table, { eq }) => eq(table.id, profile.userId),
      });
      if (!user) {
        // This should not happen because of foreign key, but handle defensively
        return null;
      }
      return {
        ...profile,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      };
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const profile = await ctx.db.query.Profile.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    });
    if (!profile) {
      return null;
    }
    const user = await ctx.db.query.user.findFirst({
      where: (table, { eq }) => eq(table.id, profile.userId),
    });
    if (!user) {
      return null;
    }
    return {
      ...profile,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    };
  }),

  update: protectedProcedure
    .input(
      profileSchemas.updateProfile.extend({
        // Mantém nickname e role obrigatórios (o fluxo sempre envia ambos)
        nickname: z.string().min(1).max(64),
        role: z.enum(["fighter", "judge", "both"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { nickname, bio, role, weightClass, wins, losses, location } =
        input;

      // Valida que a cidade informada existe (se fornecida)
      if (location && !(await validateLocation(location))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Localização inválida. Informe uma cidade existente.",
        });
      }

      // Check if profile exists
      const existingProfile = await ctx.db.query.Profile.findFirst({
        where: (table, { eq }) => eq(table.userId, userId),
      });

      if (existingProfile) {
        // Update
        const [updatedProfile] = await ctx.db
          .update(schema.Profile)
          .set({
            nickname,
            bio,
            role,
            weightClass,
            wins,
            losses,
            location,
            updatedAt: new Date(),
          })
          .where(eq(schema.Profile.userId, userId))
          .returning();

        return updatedProfile;
      } else {
        // Create
        const [newProfile] = await ctx.db
          .insert(schema.Profile)
          .values({
            userId,
            nickname,
            bio,
            role,
            weightClass,
            wins,
            losses,
            location,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return newProfile;
      }
    }),
});
