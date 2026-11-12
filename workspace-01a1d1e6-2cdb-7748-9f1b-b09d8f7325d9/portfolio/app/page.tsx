import { getDb, getProfile, getSettings } from "@/lib/db";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function HomePage() {
  const profile = getProfile();
  const settings = getSettings();
  const db = getDb();
  const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order ASC, id ASC").all() as never[];
  const projects = db.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY created_at DESC, id DESC").all() as never[];
  const experience = db.prepare("SELECT * FROM experience ORDER BY sort_order ASC, id ASC").all() as never[];
  const show = (k: string) => settings[k] !== "0";
  return (
    <>
      <Hero profile={profile} settings={settings} />
      {show("show_about") && <About profile={profile} />}
      {show("show_skills") && skills.length > 0 && <Skills skills={skills as never} />}
      {show("show_projects") && projects.length > 0 && <Projects projects={projects as never} />}
      {show("show_experience") && experience.length > 0 && <Experience items={experience as never} />}
      {show("show_contact") && <Contact profile={profile} />}
    </>
  );
}
