import { NextRequest, NextResponse } from "next/server";
import { getDb, slugify } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const db = getDb();
  const isAdmin = !!getSessionFromRequest(req);
  const rows = isAdmin
    ? db.prepare("SELECT * FROM projects ORDER BY created_at DESC, id DESC").all()
    : db.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY created_at DESC, id DESC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  let slug = String(body.slug || "").trim() || slugify(title);
  slug = slugify(slug);
  const db = getDb();
  const existing = db.prepare("SELECT id FROM projects WHERE slug = ?").get(slug) as { id: number } | undefined;
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;
  const tech = Array.isArray(body.tech) ? body.tech : String(body.tech || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const gallery = Array.isArray(body.gallery) ? body.gallery : String(body.gallery || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const status = ["completed","in_progress","archived"].includes(body.status) ? body.status : "completed";
  const info = db.prepare(
    `INSERT INTO projects (slug, title, short_desc, full_desc, cover, gallery, tech, category, github_url, live_url, date, status, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    slug, title, String(body.short_desc || ""), String(body.full_desc || ""), String(body.cover || ""),
    JSON.stringify(gallery), JSON.stringify(tech), String(body.category || "Web"),
    String(body.github_url || ""), String(body.live_url || ""), String(body.date || ""),
    status, body.published === undefined ? 1 : body.published ? 1 : 0
  );
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
