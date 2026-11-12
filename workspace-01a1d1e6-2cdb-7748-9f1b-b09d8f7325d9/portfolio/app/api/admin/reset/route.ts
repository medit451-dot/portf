import { NextRequest, NextResponse } from "next/server";
import { resetDemoData } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  resetDemoData();
  return NextResponse.json({ ok: true });
}
