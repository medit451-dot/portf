import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const existing = db.prepare("SELECT * FROM skills WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const name = body.name !== undefined ? String(body.name) : existing.name;
  if (!String(name).trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const level = body.level !== undefined ? Math.min(100, Math.max(0, Number(body.level) || 0)) : existing.level;
  db.prepare("UPDATE skills SET name = ?, category = ?, level = ?, icon = ?, sort_order = ? WHERE id = ?").run(
    name,
    body.category !== undefined ? String(body.category) : existing.category,
    level,
    body.icon !== undefined ? String(body.icon) : existing.icon,
    body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order,
    id
  );
  return NextResponse.json(db.prepare("SELECT * FROM skills WHERE id = ?").get(id));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const info = db.prepare("DELETE FROM skills WHERE id = ?").run(Number(params.id));
  if (info.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
