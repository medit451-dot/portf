import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getDb } from "./db";

export const SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s === "change-me-to-a-long-random-string") {
    console.warn("[auth] SESSION_SECRET is not set! Set it in .env.local");
    return "dev-insecure-secret-change-me";
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(userId: number, email: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ uid: userId, email, exp })).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): { uid: number; email: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = sign(payload);
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { uid: data.uid, email: data.email };
  } catch {
    return null;
  }
}

export function getSessionFromCookies(): { uid: number; email: string } | null {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function getSessionFromRequest(req: NextRequest): { uid: number; email: string } | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function isAdminRequest(req: NextRequest): boolean {
  return getSessionFromRequest(req) !== null;
}

export function requireAdmin(req: NextRequest): boolean {
  return isAdminRequest(req);
}

export function sessionCookieOptions(req?: NextRequest) {
  // The live preview may be embedded under another origin. In production
  // use a Secure, SameSite=None cookie so the browser keeps the session in
  // that preview context; localhost still accepts Secure cookies.
  const forwardedProto = req?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestProto = forwardedProto || req?.nextUrl.protocol;
  const secure = process.env.NODE_ENV === "production" || requestProto === "https:";
  return {
    httpOnly: true,
    sameSite: secure ? ("none" as const) : ("lax" as const),
    secure,
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function verifyPassword(password: string, hash: string): boolean {
  // bcryptjs compare is async; use sync version via compareSync
  const bcrypt = require("bcryptjs");
  return bcrypt.compareSync(password, hash);
}

export function findUserByEmail(email: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email) as
    | { id: number; email: string; password_hash: string }
    | undefined;
}
