import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const filter = req.nextUrl.searchParams.get("filter") || "all";
  let rows;
  if (filter === "unread") rows = db.prepare("SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC").all();
  else if (filter === "read") rows = db.prepare("SELECT * FROM messages WHERE is_read = 1 ORDER BY created_at DESC").all();
  else rows = db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const subject = String(body.subject || "").trim();
  if (!name || !email || !message) return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (message.length > 5000) return NextResponse.json({ error: "Message too long" }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const db = getDb();
  const info = db.prepare("INSERT INTO messages (name, email, subject, message, ip) VALUES (?, ?, ?, ?, ?)").run(name, email, subject, message, ip);
  const row = db.prepare("SELECT * FROM messages WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
