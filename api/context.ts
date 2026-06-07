import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { getUserFromToken } from "./lib/session";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    // Try to get token from Authorization header
    const authHeader = opts.req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      ctx.user = await getUserFromToken(token);
    }
    // Fallback to cookie
    if (!ctx.user) {
      const cookie = opts.req.headers.get("cookie");
      if (cookie) {
        const match = cookie.match(/session_token=([^;]+)/);
        if (match) {
          ctx.user = await getUserFromToken(decodeURIComponent(match[1]));
        }
      }
    }
  } catch {
    // Auth is optional
  }

  return ctx;
}
