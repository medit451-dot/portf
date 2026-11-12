"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, FolderGit2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import Reveal from "./Reveal";
import { parseJsonArray } from "@/lib/utils";
export { parseJsonArray };
import type { Project } from "@/lib/db";



export function ProjectCard({ project }: { project: Project }) {
  const { t } = useLang();
  const tech = parseJsonArray(project.tech);
  const statusLabel = project.status === "completed" ? t("projects_status_completed") : project.status === "in_progress" ? t("projects_status_in_progress") : t("projects_status_archived");
  const statusColor = project.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : project.status === "in_progress" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <Link href={`/projects/${project.slug}`} className="card glow-card overflow-hidden group flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-cyan-500/30 flex items-center justify-center overflow-hidden">
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.cover} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <FolderGit2 size={56} className="text-white/50" />
        )}
        <span className={`absolute top-3 left-3 badge border ${statusColor} backdrop-blur`}>{statusLabel}</span>
        <span className="absolute top-3 right-3 badge bg-black/50 text-white border border-white/20 backdrop-blur">{project.category}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{project.title}</h3>
        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-3 flex-1">{project.short_desc}</p>
        {tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tech.slice(0, 4).map((x) => <span key={x} className="badge bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)]">{x}</span>)}
            {tech.length > 4 && <span className="badge bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)]">+{tech.length - 4}</span>}
          </div>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400">{t("projects_view")} <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></span>
      </div>
    </Link>
  );
}

export default function Projects({ projects, showHeader = true }: { projects: Project[]; showHeader?: boolean }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const categories = useMemo(() => ["all", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const filtered = projects.filter((p) => (cat === "all" || p.category === cat) && (p.title.toLowerCase().includes(query.toLowerCase()) || p.short_desc.toLowerCase().includes(query.toLowerCase())));
  return (
    <section id="projects" className="py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {showHeader && (
          <Reveal>
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">{t("nav_projects")}</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">{t("projects_title")}</h2>
            <p className="text-[var(--muted)] mt-2">{t("projects_subtitle")}</p>
          </Reveal>
        )}
        <Reveal delay={80}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("projects_search")} className="input pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${cat === c ? "bg-indigo-600 border-indigo-600 text-white" : "border-[var(--border)] text-[var(--muted)] hover:border-indigo-500"}`}>
                  {c === "all" ? t("projects_all") : c}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-[var(--muted)]">{t("projects_empty")}</p>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => <Reveal key={p.id} delay={i * 60}><ProjectCard project={p} /></Reveal>)}
          </div>
        )}
        {showHeader && projects.length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/projects" className="btn-ghost">{t("projects_view")} <ArrowRight size={16} /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
