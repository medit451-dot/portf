import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionFromCookies();
  if (!session) redirect("/admin/login");
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
