import { getDb } from "@/lib/db";
import Projects from "@/components/Projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const db = getDb();
  const projects = db.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY created_at DESC, id DESC").all() as never[];
  return <div className="pt-16"><Projects projects={projects as never} showHeader /></div>;
}
