import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const SESSION_COOKIE = "flavour_forge_session";
const SESSION_DAYS = 14;
const scrypt = scryptCallback;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieToken(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return entry ? entry.slice(SESSION_COOKIE.length + 1) : null;
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key)));
  });
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof encoded !== "string") return false;
  const [algorithm, salt, storedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !storedHex) return false;
  const expected = Buffer.from(storedHex, "hex");
  const actual = await new Promise((resolve, reject) => {
    scrypt(password, salt, expected.length, (error, key) => (error ? reject(error) : resolve(key)));
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId, executor = db) {
  const token = randomBytes(32).toString("hex");
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  await executor
    .insert(sessions)
    .values({ userId, tokenHash: hashToken(token), expiresAt });
  return { token, maxAge };
}

export async function getCurrentUser(request) {
  const token = cookieToken(request);
  if (!token) return null;
  const [row] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      firebaseUid: users.firebaseUid,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function revokeSession(request) {
  const token = cookieToken(request);
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export function setSessionCookie(response, token, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

export function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}
