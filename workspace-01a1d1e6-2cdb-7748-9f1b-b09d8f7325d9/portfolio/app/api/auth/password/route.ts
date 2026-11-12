import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionFromRequest, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = String(body.currentPassword || "");
  const next = String(body.newPassword || "");
  if (!current || !next) return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  if (next.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.uid) as { password_hash: string } | undefined;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!verifyPassword(current, user.password_hash)) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  const hash = bcrypt.hashSync(next, 12);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, session.uid);
  return NextResponse.json({ ok: true });
}
