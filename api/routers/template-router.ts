import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { subjects, subjectSections } from "@db/schema";
import { createRouter, adminQuery } from "../middleware";

const TEMPLATES: Record<string, {
  name: string;
  icon: string;
  target: number;
  fullScore: number;
  sections: { group: string; label: string; score: number; fullScore: number; detail: string; fullDetail: string }[];
}> = {
  politics: {
    name: "政治",
    icon: "trophy",
    target: 60,
    fullScore: 100,
    sections: [
      { group: "主观", label: "主观", score: 25, fullScore: 50, detail: "25", fullDetail: "50" },
      { group: "客观", label: "客观", score: 35, fullScore: 50, detail: "35", fullDetail: "50" },
    ],
  },
  english: {
    name: "英语",
    icon: "languages",
    target: 65,
    fullScore: 100,
    sections: [
      { group: "翻译", label: "翻译", score: 6, fullScore: 10, detail: "6", fullDetail: "10" },
      { group: "小作文", label: "小作文", score: 6, fullScore: 10, detail: "6", fullDetail: "10" },
      { group: "大作文", label: "大作文", score: 13, fullScore: 20, detail: "13", fullDetail: "20" },
      { group: "阅读", label: "阅读", score: 30, fullScore: 40, detail: "30", fullDetail: "40" },
      { group: "新题型", label: "新题型", score: 6, fullScore: 10, detail: "6", fullDetail: "10" },
      { group: "完形", label: "完形", score: 4, fullScore: 10, detail: "4", fullDetail: "10" },
    ],
  },
  math: {
    name: "数学一",
    icon: "calculator",
    target: 125,
    fullScore: 150,
    sections: [
      { group: "选择", label: "选择", score: 45, fullScore: 50, detail: "45", fullDetail: "50" },
      { group: "填空", label: "填空", score: 25, fullScore: 30, detail: "25", fullDetail: "30" },
      { group: "17题", label: "17题", score: 8, fullScore: 10, detail: "8", fullDetail: "10" },
      { group: "18题", label: "18题", score: 10, fullScore: 12, detail: "10", fullDetail: "12" },
      { group: "19题", label: "19题", score: 10, fullScore: 12, detail: "10", fullDetail: "12" },
      { group: "20题", label: "20题", score: 10, fullScore: 12, detail: "10", fullDetail: "12" },
      { group: "21题", label: "21题", score: 10, fullScore: 12, detail: "10", fullDetail: "12" },
      { group: "22题", label: "22题", score: 7, fullScore: 12, detail: "7", fullDetail: "12" },
    ],
  },
  cs408: {
    name: "408",
    icon: "monitor",
    target: 110,
    fullScore: 150,
    sections: [
      { group: "选择", label: "数据结构选择", score: 20, fullScore: 22, detail: "20", fullDetail: "22" },
      { group: "选择", label: "计组选择", score: 18, fullScore: 22, detail: "18", fullDetail: "22" },
      { group: "选择", label: "操作系统选择", score: 16, fullScore: 20, detail: "16", fullDetail: "20" },
      { group: "选择", label: "计网选择", score: 12, fullScore: 16, detail: "12", fullDetail: "16" },
      { group: "大题", label: "算法题", score: 8, fullScore: 13, detail: "8", fullDetail: "13" },
      { group: "大题", label: "数据结构应用题", score: 7, fullScore: 10, detail: "7", fullDetail: "10" },
      { group: "大题", label: "计组1", score: 7, fullScore: 12, detail: "7", fullDetail: "12" },
      { group: "大题", label: "计组2", score: 4, fullScore: 11, detail: "4", fullDetail: "11" },
      { group: "大题", label: "操作系统1", score: 7, fullScore: 9, detail: "7", fullDetail: "9" },
      { group: "大题", label: "操作系统2", score: 4, fullScore: 6, detail: "4", fullDetail: "6" },
      { group: "大题", label: "计网", score: 7, fullScore: 9, detail: "7", fullDetail: "9" },
    ],
  },
};

export const templateRouter = createRouter({
  list: adminQuery.query(() => {
    return Object.entries(TEMPLATES).map(([key, t]) => ({
      key,
      name: t.name,
      icon: t.icon,
      target: t.target,
      fullScore: t.fullScore,
      sectionCount: t.sections.length,
    }));
  }),

  detail: adminQuery
    .input(z.object({ key: z.string() }))
    .query(({ input }) => {
      const t = TEMPLATES[input.key];
      if (!t) throw new Error("模板不存在");
      return t;
    }),

  applyOne: adminQuery
    .input(z.object({
      templateKey: z.string(),
      userId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const t = TEMPLATES[input.templateKey];
      if (!t) throw new Error("模板不存在");

      // Check if user already has this subject
      const existing = await db.query.subjects.findMany({
        where: eq(subjects.userId, input.userId),
      });
      if (existing.find(s => s.name === t.name)) {
        throw new Error(`该用户已有"${t.name}"科目`);
      }

      // Create subject
      const [sub] = await db.insert(subjects).values({
        userId: input.userId,
        name: t.name,
        icon: t.icon,
        target: t.target,
        fullScore: t.fullScore,
      }).$returningId();

      // Create sections
      for (const sec of t.sections) {
        await db.insert(subjectSections).values({
          subjectId: sub.id,
          group: sec.group,
          label: sec.label,
          score: sec.score,
          fullScore: sec.fullScore,
          detail: sec.detail,
          fullDetail: sec.fullDetail,
        });
      }

      return { id: sub.id, name: t.name };
    }),

  applyAllTemplates: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const results = [];
      for (const [, t] of Object.entries(TEMPLATES)) {
        // Check existing
        const existing = await db.query.subjects.findMany({
          where: eq(subjects.userId, input.userId),
        });
        if (existing.find(s => s.name === t.name)) continue;

        const [sub] = await db.insert(subjects).values({
          userId: input.userId,
          name: t.name,
          icon: t.icon,
          target: t.target,
          fullScore: t.fullScore,
        }).$returningId();

        for (const sec of t.sections) {
          await db.insert(subjectSections).values({
            subjectId: sub.id,
            group: sec.group,
            label: sec.label,
            score: sec.score,
            fullScore: sec.fullScore,
            detail: sec.detail,
            fullDetail: sec.fullDetail,
          });
        }
        results.push({ id: sub.id, name: t.name });
      }
      return results;
    }),
});
