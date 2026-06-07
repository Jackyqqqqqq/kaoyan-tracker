import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { userSettings, users } from "@db/schema";
import { createRouter, authedQuery, adminQuery } from "../middleware";

export const settingsRouter = createRouter({
  // User: get own settings (or auto-create defaults)
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    let settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, ctx.user!.id),
    });
    if (!settings) {
      await db.insert(userSettings).values({ userId: ctx.user!.id });
      settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, ctx.user!.id),
      });
    }
    return settings!;
  }),

  // Admin: get settings for any user
  getForUser: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      let settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, input.userId),
      });
      if (!settings) {
        await db.insert(userSettings).values({ userId: input.userId });
        settings = await db.query.userSettings.findFirst({
          where: eq(userSettings.userId, input.userId),
        });
      }
      return settings!;
    }),

  // Admin: update settings for any user
  updateForUser: adminQuery
    .input(z.object({
      userId: z.number(),
      examDate: z.string().optional(),
      totalTarget: z.number().optional(),
      schoolName: z.string().optional(),
      majorCode: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, input.userId),
      });
      if (!existing) {
        await db.insert(userSettings).values({
          userId: input.userId,
          ...(input.examDate && { examDate: input.examDate }),
          ...(input.totalTarget && { totalTarget: input.totalTarget }),
          ...(input.schoolName && { schoolName: input.schoolName }),
          ...(input.majorCode && { majorCode: input.majorCode }),
          ...(input.description && { description: input.description }),
        });
      } else {
        await db.update(userSettings)
          .set({
            ...(input.examDate !== undefined && { examDate: input.examDate }),
            ...(input.totalTarget !== undefined && { totalTarget: input.totalTarget }),
            ...(input.schoolName !== undefined && { schoolName: input.schoolName }),
            ...(input.majorCode !== undefined && { majorCode: input.majorCode }),
            ...(input.description !== undefined && { description: input.description }),
            updatedAt: new Date(),
          })
          .where(eq(userSettings.id, existing.id));
      }
      return { success: true };
    }),

  // User: update theme
  updateTheme: authedQuery
    .input(z.object({
      theme: z.enum(["dark", "light", "ocean", "sakura", "cyber"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(users)
        .set({ theme: input.theme })
        .where(eq(users.id, ctx.user!.id));
      return { success: true };
    }),
});
