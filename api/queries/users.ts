import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUsername(username: string) {
  return getDb().query.users.findFirst({
    where: eq(schema.users.username, username),
  });
}

export async function findUserById(id: number) {
  return getDb().query.users.findFirst({
    where: eq(schema.users.id, id),
  });
}
