import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
const TYPES = ["work","internship","education","certificate","achievement"];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const existing = db.prepare("SELECT * FROM experience WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const title = body.title !== undefined ? String(body.title) : existing.title;
  if (!String(title).trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  db.prepare("UPDATE experience SET type = ?, title = ?, org = ?, period = ?, description = ?, sort_order = ? WHERE id = ?").run(
    body.type !== undefined && TYPES.includes(body.type) ? body.type : existing.type,
    title,
    body.org !== undefined ? String(body.org) : existing.org,
    body.period !== undefined ? String(body.period) : existing.period,
    body.description !== undefined ? String(body.description) : existing.description,
    body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order,
    id
  );
  return NextResponse.json(db.prepare("SELECT * FROM experience WHERE id = ?").get(id));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const info = db.prepare("DELETE FROM experience WHERE id = ?").run(Number(params.id));
  if (info.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
