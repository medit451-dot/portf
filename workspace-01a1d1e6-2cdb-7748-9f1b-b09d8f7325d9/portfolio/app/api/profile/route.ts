import { NextRequest, NextResponse } from "next/server";
import { getDb, getProfile } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getProfile());
}

export async function PUT(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const allowed = ["name","title","subtitle","bio","about_text","specialization","interests","avatar_url","email","location","github","linkedin","discord","telegram","resume_url","stats"];
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const k of allowed) {
    if (body[k] !== undefined) { fields.push(`${k} = ?`); values.push(String(body[k])); }
  }
  if (fields.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const db = getDb();
  db.prepare(`UPDATE profile SET ${fields.join(", ")}, updated_at = datetime('now') WHERE id = 1`).run(...values);
  return NextResponse.json(getProfile());
}
