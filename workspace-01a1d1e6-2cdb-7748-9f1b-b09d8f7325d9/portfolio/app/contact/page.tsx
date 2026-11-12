import { getProfile } from "@/lib/db";
import Contact from "@/components/Contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ContactPage() {
  const profile = getProfile();
  return <div className="pt-16"><Contact profile={profile} /></div>;
}
