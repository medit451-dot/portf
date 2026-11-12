"use client";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Calendar, FolderGit2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ProjectCard } from "@/components/Projects";
import type { Project } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function ProjectDetailClient({ project: p, tech, gallery, others }: { project: Project; tech: string[]; gallery: string[]; others: Project[] }) {
  const { t } = useLang();
  const statusLabel = p.status === "completed" ? t("projects_status_completed") : p.status === "in_progress" ? t("projects_status_in_progress") : t("projects_status_archived");
  return (
    <div className="pt-24 pb-10 max-w-5xl mx-auto px-4 sm:px-6">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] mb-8"><ArrowLeft size={16} /> {t("projects_back")}</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">{p.category}</span>
            <span className="badge bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)]">{statusLabel}</span>
            {p.date && <span className="badge bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)]"><Calendar size={12} /> {formatDate(p.date)}</span>}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">{p.title}</h1>
          {p.short_desc && <p className="mt-3 text-lg text-[var(--muted)]">{p.short_desc}</p>}
        </div>
        <div className="flex gap-2">
          {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="btn-ghost !px-4"><Github size={17} /> {t("projects_github")}</a>}
          {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="btn-primary !px-4"><ExternalLink size={17} /> {t("projects_demo")}</a>}
        </div>
      </div>
      <div className="mt-8 rounded-3xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-indigo-600/30 to-cyan-500/20 aspect-video flex items-center justify-center">
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <FolderGit2 size={80} className="text-white/40" />
        )}
      </div>
      {p.full_desc && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">{t("admin_full_desc")}</h2>
          <p className="text-[var(--muted)] leading-relaxed whitespace-pre-line">{p.full_desc}</p>
        </div>
      )}
      {tech.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">{t("projects_tech")}</h2>
          <div className="flex flex-wrap gap-2">{tech.map((x) => <span key={x} className="badge bg-[var(--surface-2)] border border-[var(--border)]">{x}</span>)}</div>
        </div>
      )}
      {gallery.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">{t("projects_gallery")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {gallery.map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={g} alt={`${p.title} ${i + 1}`} className="rounded-2xl border border-[var(--border)] w-full aspect-video object-cover" />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6">{t("projects_title")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((o) => <ProjectCard key={o.id} project={o} />)}
          </div>
        </div>
      )}
    </div>
  );
}
