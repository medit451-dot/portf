import { getDb, getProfile } from "@/lib/db";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AboutPage() {
  const profile = getProfile();
  const db = getDb();
  const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order ASC, id ASC").all() as never[];
  const experience = db.prepare("SELECT * FROM experience ORDER BY sort_order ASC, id ASC").all() as never[];
  return (
    <div className="pt-16">
      <About profile={profile} />
      {skills.length > 0 && <Skills skills={skills as never} />}
      {experience.length > 0 && <Experience items={experience as never} />}
    </div>
  );
}
