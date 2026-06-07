import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { subjects, subjectSections } from "@db/schema";
import { createRouter, authedQuery, adminQuery } from "../middleware";

export const subjectRouter = createRouter({
  // User: list own subjects (read-only)
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.subjects.findMany({
      where: eq(subjects.userId, ctx.user!.id),
      orderBy: asc(subjects.sortOrder),
      with: { sections: { orderBy: asc(subjectSections.sortOrder) } },
    });
  }),

  // Admin: list any user's subjects
  listByUser: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.subjects.findMany({
        where: eq(subjects.userId, input.userId),
        orderBy: asc(subjects.sortOrder),
        with: { sections: { orderBy: asc(subjectSections.sortOrder) } },
      });
    }),

  // Admin: create subject for any user
  adminCreateSubject: adminQuery
    .input(z.object({
      userId: z.number(),
      name: z.string().min(1),
      icon: z.string().default("book"),
      target: z.number(),
      fullScore: z.number(),
      sections: z.array(z.object({
        group: z.string().default(""),
        label: z.string(), score: z.number(), fullScore: z.number(),
        detail: z.string().optional(), fullDetail: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [sub] = await db.insert(subjects).values({
        userId: input.userId, name: input.name, icon: input.icon,
        target: input.target, fullScore: input.fullScore,
      }).$returningId();
      for (const sec of input.sections) {
        await db.insert(subjectSections).values({
          subjectId: sub.id, group: sec.group, label: sec.label, score: sec.score,
          fullScore: sec.fullScore, detail: sec.detail, fullDetail: sec.fullDetail,
        });
      }
      return { id: sub.id };
    }),

  // Admin: update any subject
  adminUpdateSubject: adminQuery
    .input(z.object({
      id: z.number(),
      userId: z.number(),
      name: z.string().optional(),
      target: z.number().optional(),
      fullScore: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(subjects)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.target !== undefined && { target: input.target }),
          ...(input.fullScore !== undefined && { fullScore: input.fullScore }),
          updatedAt: new Date(),
        })
        .where(and(eq(subjects.id, input.id), eq(subjects.userId, input.userId)));
      return { success: true };
    }),

  // Admin: delete any subject
  adminDeleteSubject: adminQuery
    .input(z.object({ id: z.number(), userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(subjectSections).where(eq(subjectSections.subjectId, input.id));
      await db.delete(subjects).where(and(eq(subjects.id, input.id), eq(subjects.userId, input.userId)));
      return { success: true };
    }),

  // Admin: create section for any subject
  adminCreateSection: adminQuery
    .input(z.object({
      subjectId: z.number(),
      group: z.string().default(""),
      label: z.string(), score: z.number(), fullScore: z.number(),
      detail: z.string().optional(), fullDetail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [sec] = await db.insert(subjectSections).values({
        subjectId: input.subjectId, group: input.group, label: input.label, score: input.score,
        fullScore: input.fullScore, detail: input.detail, fullDetail: input.fullDetail,
      }).$returningId();
      return { id: sec.id };
    }),

  // Admin: update any section
  adminUpdateSection: adminQuery
    .input(z.object({
      id: z.number(),
      group: z.string().optional(),
      label: z.string().optional(),
      score: z.number().optional(),
      fullScore: z.number().optional(),
      detail: z.string().optional(),
      fullDetail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(subjectSections)
        .set({
          ...(input.group !== undefined && { group: input.group }),
          ...(input.label !== undefined && { label: input.label }),
          ...(input.score !== undefined && { score: input.score }),
          ...(input.fullScore !== undefined && { fullScore: input.fullScore }),
          ...(input.detail !== undefined && { detail: input.detail }),
          ...(input.fullDetail !== undefined && { fullDetail: input.fullDetail }),
        })
        .where(eq(subjectSections.id, input.id));
      return { success: true };
    }),

  // Admin: delete any section
  adminDeleteSection: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(subjectSections).where(eq(subjectSections.id, input.id));
      return { success: true };
    }),
});
