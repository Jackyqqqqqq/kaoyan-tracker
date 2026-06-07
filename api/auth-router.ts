import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, userSettings } from "@db/schema";
import { createSession } from "./lib/session";

export const authRouter = createRouter({
  register: publicQuery
    .input(z.object({
      username: z.string().min(3).max(50),
      password: z.string().min(6).max(100),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
      if (existing) throw new Error("用户名已存在");

      const hashed = await bcrypt.hash(input.password, 10);
      const [inserted] = await db.insert(users).values({
        username: input.username,
        password: hashed,
        name: input.name || input.username,
      }).$returningId();

      // Create personal settings for user
      await db.insert(userSettings).values({ userId: inserted.id });

      // No default subjects - user starts blank
      const token = await createSession(inserted.id);
      return { token, user: { id: inserted.id, username: input.username, name: input.name || input.username, role: "user" } };
    }),

  login: publicQuery
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
      if (!user) throw new Error("用户名或密码错误");
      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) throw new Error("用户名或密码错误");
      const token = await createSession(user.id);
      return { token, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  me: authedQuery.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const { password, ...withoutPw } = ctx.user;
    return withoutPw;
  }),
});
