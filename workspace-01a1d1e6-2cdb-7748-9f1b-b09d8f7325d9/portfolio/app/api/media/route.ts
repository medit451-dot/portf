import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml","application/pdf"];

export async function GET(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  return NextResponse.json(db.prepare("SELECT * FROM media ORDER BY created_at DESC").all());
}

export async function POST(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }
  const files = formData.getAll("file").filter((v): v is File => v instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  const db = getDb();
  const results = [];
  for (const file of files) {
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: `Invalid file format: ${file.type}` }, { status: 400 });
    const ext = path.extname(file.name) || "";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const dest = path.join(uploadDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    const publicPath = `/uploads/${safeName}`;
    const info = db.prepare("INSERT INTO media (filename, path, size, mime) VALUES (?, ?, ?, ?)").run(file.name, publicPath, file.size, file.type);
    results.push(db.prepare("SELECT * FROM media WHERE id = ?").get(info.lastInsertRowid));
  }
  return NextResponse.json(results.length === 1 ? results[0] : results, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const db = getDb();
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(id) as { path: string } | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const filePath = path.join(process.cwd(), "public", row.path.replace(/^\//, ""));
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
