import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { upsertFirebaseAdmin } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD2XFJXdciYgVLdqDXOQGNeQGcy6f7bp-Y";

type LookupUser = {
  localId?: string;
  email?: string;
  providerUserInfo?: Array<{ providerId?: string; email?: string }>;
};

/**
 * Firebase ID tokens are verified by Google's Identity Toolkit endpoint. This
 * avoids trusting a uid/email sent by the browser and does not require a
 * service-account JSON file in the project.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = String(body.idToken || "").trim();
    if (!idToken) return NextResponse.json({ error: "Firebase token is required" }, { status: 400 });

    const lookupResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      },
    );
    const lookup = await lookupResponse.json().catch(() => ({})) as { users?: LookupUser[] };
    const firebaseUser = lookup.users?.[0];
    const uid = String(firebaseUser?.localId || "");
    const email = String(firebaseUser?.email || "").trim().toLowerCase();
    const provider = String(firebaseUser?.providerUserInfo?.[0]?.providerId || "firebase");

    // Anonymous Firebase sessions are deliberately kept as observers. Only a
    // verified email/Google account becomes an administrator.
    if (!lookupResponse.ok || !uid || !email) {
      return NextResponse.json({ error: "Only registered Firebase accounts can access admin" }, { status: 403 });
    }

    const user = upsertFirebaseAdmin({ uid, email, provider });
    const token = createSessionToken(user.id, user.email);
    const response = NextResponse.json({ ok: true, email: user.email, role: user.role });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(req));
    return response;
  } catch (error) {
    console.error("[firebase-auth] account sync failed", error);
    return NextResponse.json({ error: "Unable to create admin session" }, { status: 500 });
  }
}
