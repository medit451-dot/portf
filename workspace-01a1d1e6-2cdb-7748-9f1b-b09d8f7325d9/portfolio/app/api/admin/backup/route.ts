import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { getDb().prepare("PRAGMA wal_checkpoint(TRUNCATE)").get(); } catch {}
  const dbPath = path.join(process.cwd(), "data", "portfolio.db");
  if (!fs.existsSync(dbPath)) return NextResponse.json({ error: "Database file not found" }, { status: 404 });
  const data = fs.readFileSync(dbPath);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.db"`,
      "Content-Length": String(data.length),
    },
  });
}
