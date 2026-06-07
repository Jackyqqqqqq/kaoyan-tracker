import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import type { User } from "@db/schema";

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "kaoyan-tracker-secret-key-2026"
);

export async function createSession(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySession(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, { clockTolerance: 60 });
    if (payload.userId && typeof payload.userId === "number") {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<User | undefined> {
  const session = await verifySession(token);
  if (!session) return undefined;
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  return user || undefined;
}
