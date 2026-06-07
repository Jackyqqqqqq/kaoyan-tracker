import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { changeRequests, taskReminders, users } from "@db/schema";
import { createRouter, authedQuery, adminQuery } from "../middleware";

export const requestRouter = createRouter({
  // ── Change Requests ──
  listMyRequests: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.changeRequests.findMany({
      where: eq(changeRequests.userId, ctx.user!.id),
      orderBy: [desc(changeRequests.createdAt)],
    });
  }),

  listAllRequests: adminQuery.query(async () => {
    const db = getDb();
    return db.query.changeRequests.findMany({
      orderBy: [desc(changeRequests.createdAt)],
    });
  }),

  createRequest: authedQuery
    .input(z.object({
      subjectName: z.string().min(1),
      currentTarget: z.number(),
      requestedTarget: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db.insert(changeRequests).values({
        userId: ctx.user!.id,
        userName: ctx.user!.name || ctx.user!.username || "未知用户",
        subjectName: input.subjectName,
        currentTarget: input.currentTarget,
        requestedTarget: input.requestedTarget,
        reason: input.reason || "",
      }).$returningId();
      return { id: result.id };
    }),

  resolveRequest: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(changeRequests)
        .set({ status: input.status, resolvedAt: new Date() })
        .where(eq(changeRequests.id, input.id));
      return { success: true };
    }),

  // ── Task Reminders ──
  listMyReminders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.taskReminders.findMany({
      where: eq(taskReminders.userId, ctx.user!.id),
      orderBy: [desc(taskReminders.createdAt)],
    });
  }),

  listAllReminders: adminQuery.query(async () => {
    const db = getDb();
    return db.query.taskReminders.findMany({
      orderBy: [desc(taskReminders.createdAt)],
    });
  }),

  createReminder: authedQuery
    .input(z.object({ message: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db.insert(taskReminders).values({
        userId: ctx.user!.id,
        userName: ctx.user!.name || ctx.user!.username || "未知用户",
        message: input.message,
      }).$returningId();
      return { id: result.id };
    }),

  markReminderDone: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(taskReminders)
        .set({ status: "done" })
        .where(and(eq(taskReminders.id, input.id), eq(taskReminders.userId, ctx.user!.id)));
      return { success: true };
    }),

  // ── Admin: list all users ──
  listUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
  }),

  // ── Admin: stats ──
  stats: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.query.users.findMany();
    const allRequests = await db.query.changeRequests.findMany();
    const allReminders = await db.query.taskReminders.findMany();
    const allPlans = await db.query.weeklyPlans.findMany();
    return {
      totalUsers: allUsers.length,
      adminCount: allUsers.filter(u => u.role === "admin").length,
      totalRequests: allRequests.length,
      pendingRequests: allRequests.filter(r => r.status === "pending").length,
      totalReminders: allReminders.length,
      newReminders: allReminders.filter(r => r.status === "new").length,
      totalPlans: allPlans.length,
    };
  }),
});
