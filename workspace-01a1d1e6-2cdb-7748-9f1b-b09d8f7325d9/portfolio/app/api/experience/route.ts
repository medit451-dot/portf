import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
const TYPES = ["work","internship","education","certificate","achievement"];

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.prepare("SELECT * FROM experience ORDER BY sort_order ASC, id ASC").all());
}

export async function POST(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const type = TYPES.includes(body.type) ? body.type : "work";
  const db = getDb();
  const maxOrder = (db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM experience").get() as { m: number }).m;
  const info = db.prepare("INSERT INTO experience (type, title, org, period, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run(
    type, title, String(body.org || ""), String(body.period || ""), String(body.description || ""), Number(body.sort_order ?? maxOrder + 1)
  );
  return NextResponse.json(db.prepare("SELECT * FROM experience WHERE id = ?").get(info.lastInsertRowid), { status: 201 });
}
