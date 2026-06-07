import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { announcements } from "@db/schema";
import { createRouter, adminQuery, authedQuery } from "../middleware";

export const announcementRouter = createRouter({
  // User: list visible announcements
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user!.id;
    const all = await db.query.announcements.findMany({
      orderBy: [desc(announcements.createdAt)],
      with: { creator: true },
    });
    return all.filter(a => a.scope === "all" || a.targetUserId === userId);
  }),

  // Admin: create
  create: adminQuery
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      scope: z.enum(["all", "personal"]).default("all"),
      targetUserId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db.insert(announcements).values({
        title: input.title,
        content: input.content,
        scope: input.scope,
        targetUserId: input.scope === "personal" ? input.targetUserId : null,
        createdBy: ctx.user!.id,
      }).$returningId();
      return { id: result.id };
    }),

  // Admin: remove
  remove: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),

  // Admin: list all
  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.query.announcements.findMany({
      orderBy: [desc(announcements.createdAt)],
      with: { creator: true, targetUser: true },
    });
  }),
});
