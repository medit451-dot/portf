import { NextRequest, NextResponse } from "next/server";
import { getDb, getSettings } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const allowed = ["site_name","site_description","logo_text","favicon","show_about","show_skills","show_projects","show_experience","show_contact","hero_button_projects","hero_button_contact","og_image","seo_title","seo_description"];
  const db = getDb();
  const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  let count = 0;
  for (const k of allowed) {
    if (body[k] !== undefined) { stmt.run(k, String(body[k])); count++; }
  }
  if (count === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  return NextResponse.json(getSettings());
}
