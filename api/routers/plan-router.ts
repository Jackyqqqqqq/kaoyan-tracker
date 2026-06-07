import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { weeklyPlans } from "@db/schema";
import { createRouter, authedQuery, adminQuery } from "../middleware";

export const planRouter = createRouter({
  // User: list plans visible to them (global + personal)
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user!.id;
    const allPlans = await db.query.weeklyPlans.findMany({
      orderBy: [desc(weeklyPlans.weekNumber)],
      with: { creator: true, targetUser: true },
    });
    // Filter: show global plans + personal plans for this user
    return allPlans.filter(p => p.scope === "all" || p.targetUserId === userId);
  }),

  // Admin: all plans
  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.query.weeklyPlans.findMany({
      orderBy: [desc(weeklyPlans.weekNumber)],
      with: { creator: true, targetUser: true },
    });
  }),

  create: adminQuery
    .input(z.object({
      weekNumber: z.number().min(1),
      title: z.string().min(1),
      content: z.string().min(1),
      scope: z.enum(["all", "personal"]).default("all"),
      targetUserId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db.insert(weeklyPlans).values({
        weekNumber: input.weekNumber,
        title: input.title,
        content: input.content,
        scope: input.scope,
        targetUserId: input.scope === "personal" ? input.targetUserId : null,
        createdBy: ctx.user!.id,
      }).$returningId();
      return { id: result.id };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      weekNumber: z.number().optional(),
      title: z.string().optional(),
      content: z.string().optional(),
      scope: z.enum(["all", "personal"]).optional(),
      targetUserId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(weeklyPlans)
        .set({
          ...(input.weekNumber !== undefined && { weekNumber: input.weekNumber }),
          ...(input.title !== undefined && { title: input.title }),
          ...(input.content !== undefined && { content: input.content }),
          ...(input.scope !== undefined && { scope: input.scope }),
          ...(input.targetUserId !== undefined && { targetUserId: input.targetUserId }),
        })
        .where(eq(weeklyPlans.id, input.id));
      return { success: true };
    }),

  remove: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(weeklyPlans).where(eq(weeklyPlans.id, input.id));
      return { success: true };
    }),
});
