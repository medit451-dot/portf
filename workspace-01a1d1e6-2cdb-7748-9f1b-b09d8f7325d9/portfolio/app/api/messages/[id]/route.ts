import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const isRead = body.is_read !== undefined ? (body.is_read ? 1 : 0) : 1;
  const info = db.prepare("UPDATE messages SET is_read = ? WHERE id = ?").run(isRead, Number(params.id));
  if (info.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(db.prepare("SELECT * FROM messages WHERE id = ?").get(Number(params.id)));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const info = db.prepare("DELETE FROM messages WHERE id = ?").run(Number(params.id));
  if (info.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
