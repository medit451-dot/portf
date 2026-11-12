import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const count = (sql: string) => (db.prepare(sql).get() as { c: number }).c;
  const dbPath = path.join(process.cwd(), "data", "portfolio.db");
  let dbSize = 0;
  try { dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0; } catch {}
  const mediaSize = (db.prepare("SELECT COALESCE(SUM(size),0) as s FROM media").get() as { s: number }).s;
  return NextResponse.json({
    projects: count("SELECT COUNT(*) as c FROM projects"),
    published: count("SELECT COUNT(*) as c FROM projects WHERE published = 1"),
    skills: count("SELECT COUNT(*) as c FROM skills"),
    messages: count("SELECT COUNT(*) as c FROM messages"),
    unread: count("SELECT COUNT(*) as c FROM messages WHERE is_read = 0"),
    media: count("SELECT COUNT(*) as c FROM media"),
    experience: count("SELECT COUNT(*) as c FROM experience"),
    dbSize, mediaSize,
    recentProjects: db.prepare("SELECT * FROM projects ORDER BY updated_at DESC LIMIT 5").all(),
    recentMessages: db.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT 5").all(),
  });
}
