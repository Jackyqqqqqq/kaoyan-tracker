import { relations } from "drizzle-orm";
import { users, subjects, subjectSections, weeklyPlans, announcements, userSettings } from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  subjects: many(subjects),
  settings: one(userSettings, { fields: [users.id], references: [userSettings.userId] }),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, { fields: [subjects.userId], references: [users.id] }),
  sections: many(subjectSections),
}));

export const subjectSectionsRelations = relations(subjectSections, ({ one }) => ({
  subject: one(subjects, { fields: [subjectSections.subjectId], references: [subjects.id] }),
}));

export const weeklyPlansRelations = relations(weeklyPlans, ({ one }) => ({
  creator: one(users, { fields: [weeklyPlans.createdBy], references: [users.id] }),
  targetUser: one(users, { fields: [weeklyPlans.targetUserId], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, { fields: [announcements.createdBy], references: [users.id] }),
  targetUser: one(users, { fields: [announcements.targetUserId], references: [users.id] }),
}));
