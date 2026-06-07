import { authRouter } from "./auth-router";
import { subjectRouter } from "./routers/subject-router";
import { planRouter } from "./routers/plan-router";
import { requestRouter } from "./routers/request-router";
import { settingsRouter } from "./routers/settings-router";
import { announcementRouter } from "./routers/announcement-router";
import { templateRouter } from "./routers/template-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  subject: subjectRouter,
  plan: planRouter,
  request: requestRouter,
  settings: settingsRouter,
  announcement: announcementRouter,
  template: templateRouter,
});

export type AppRouter = typeof appRouter;
