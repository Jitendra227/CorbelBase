import { randomBytes } from "node:crypto";
import { database } from "../lib/database";
import { userSessions } from "../db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function createSession(userId: string) {
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await database.insert(userSessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return {
    id: sessionId,
    expiresAt,
  };
}

export async function deleteSession(sessionId: string) {
  await database.delete(userSessions).where(eq(userSessions.id, sessionId));
}

export async function getSession(sessionId: string) {
  const [session] = await database
    .select({
      id: userSessions.id,
      userId: userSessions.userId,
      expiresAt: userSessions.expiresAt,
    })
    .from(userSessions)
    .where(
      and(
        eq(userSessions.id, sessionId),
        gt(userSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return session ?? null;
}
