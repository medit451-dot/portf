import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM skills ORDER BY sort_order ASC, id ASC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const level = Math.min(100, Math.max(0, Number(body.level) || 0));
  const db = getDb();
  const maxOrder = (db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM skills").get() as { m: number }).m;
  const info = db.prepare("INSERT INTO skills (name, category, level, icon, sort_order) VALUES (?, ?, ?, ?, ?)").run(
    name, String(body.category || "Tools & Technologies"), level, String(body.icon || "code"), Number(body.sort_order ?? maxOrder + 1)
  );
  const row = db.prepare("SELECT * FROM skills WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
