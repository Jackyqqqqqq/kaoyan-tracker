import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
} from "drizzle-orm/mysql-core";

// ── Users ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  theme: mysqlEnum("theme", ["dark", "light", "ocean", "sakura", "cyber"]).default("dark").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── User Settings (per user, managed by admin) ──
export const userSettings = mysqlTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  examDate: varchar("exam_date", { length: 20 }).default("2026-12-21").notNull(),
  totalTarget: int("total_target").default(360).notNull(),
  schoolName: varchar("school_name", { length: 255 }).default("北京邮电大学").notNull(),
  majorCode: varchar("major_code", { length: 50 }).default("11408").notNull(),
  description: varchar("description", { length: 500 }).default("计算机考研").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── Subjects ──
export const subjects = mysqlTable("subjects", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("book").notNull(),
  target: int("target").notNull(),
  fullScore: int("full_score").default(100).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const subjectSections = mysqlTable("subject_sections", {
  id: serial("id").primaryKey(),
  subjectId: bigint("subject_id", { mode: "number", unsigned: true }).notNull(),
  group: varchar("group", { length: 100 }).default("").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  score: int("score").default(0).notNull(),
  fullScore: int("full_score").default(100).notNull(),
  detail: varchar("detail", { length: 255 }),
  fullDetail: varchar("full_detail", { length: 255 }),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Weekly Plans (global) ──
export const weeklyPlans = mysqlTable("weekly_plans", {
  id: serial("id").primaryKey(),
  weekNumber: int("week_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  scope: mysqlEnum("scope", ["all", "personal"]).default("all").notNull(),
  targetUserId: bigint("target_user_id", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Change Requests ──
export const changeRequests = mysqlTable("change_requests", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  subjectName: varchar("subject_name", { length: 100 }).notNull(),
  currentTarget: int("current_target").default(0).notNull(),
  requestedTarget: int("requested_target").notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// ── Task Reminders ──
export const taskReminders = mysqlTable("task_reminders", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "done"]).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Announcements ──
export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  scope: mysqlEnum("scope", ["all", "personal"]).default("all").notNull(),
  targetUserId: bigint("target_user_id", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type UserSetting = typeof userSettings.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type SubjectSection = typeof subjectSections.$inferSelect;
export type WeeklyPlan = typeof weeklyPlans.$inferSelect;
export type ChangeRequest = typeof changeRequests.$inferSelect;
export type TaskReminder = typeof taskReminders.$inferSelect;
