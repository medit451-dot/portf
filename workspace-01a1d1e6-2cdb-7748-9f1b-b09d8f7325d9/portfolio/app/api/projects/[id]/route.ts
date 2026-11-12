import { NextRequest, NextResponse } from "next/server";
import { getDb, slugify } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const title = body.title !== undefined ? String(body.title) : existing.title;
  if (!String(title).trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  let slug = body.slug !== undefined ? slugify(String(body.slug)) : (existing.slug as string);
  if (body.slug !== undefined) {
    const dup = db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?").get(slug, id) as { id: number } | undefined;
    if (dup) slug = `${slug}-${Date.now().toString(36)}`;
  }
  const tech = body.tech !== undefined ? (Array.isArray(body.tech) ? body.tech : String(body.tech).split(",").map((s: string) => s.trim()).filter(Boolean)) : JSON.parse(String(existing.tech || "[]"));
  const gallery = body.gallery !== undefined ? (Array.isArray(body.gallery) ? body.gallery : String(body.gallery).split(",").map((s: string) => s.trim()).filter(Boolean)) : JSON.parse(String(existing.gallery || "[]"));
  const status = body.status !== undefined && ["completed","in_progress","archived"].includes(body.status) ? body.status : existing.status;
  db.prepare(
    `UPDATE projects SET slug = ?, title = ?, short_desc = ?, full_desc = ?, cover = ?, gallery = ?, tech = ?, category = ?, github_url = ?, live_url = ?, date = ?, status = ?, published = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    slug, title,
    body.short_desc !== undefined ? String(body.short_desc) : existing.short_desc,
    body.full_desc !== undefined ? String(body.full_desc) : existing.full_desc,
    body.cover !== undefined ? String(body.cover) : existing.cover,
    JSON.stringify(gallery), JSON.stringify(tech),
    body.category !== undefined ? String(body.category) : existing.category,
    body.github_url !== undefined ? String(body.github_url) : existing.github_url,
    body.live_url !== undefined ? String(body.live_url) : existing.live_url,
    body.date !== undefined ? String(body.date) : existing.date,
    status,
    body.published !== undefined ? (body.published ? 1 : 0) : existing.published,
    id
  );
  return NextResponse.json(db.prepare("SELECT * FROM projects WHERE id = ?").get(id));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const info = db.prepare("DELETE FROM projects WHERE id = ?").run(Number(params.id));
  if (info.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
