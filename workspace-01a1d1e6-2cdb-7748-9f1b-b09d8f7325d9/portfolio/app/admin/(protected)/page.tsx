"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, Award, Mail, Image as ImageIcon, Plus, Eye, Loader2, Database, HardDrive } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatFileSize, formatDate } from "@/lib/utils";

interface Stats {
  projects: number; published: number; skills: number; messages: number; unread: number; media: number; experience: number; dbSize: number; mediaSize: number;
  recentProjects: { id: number; title: string; slug: string; published: number; updated_at: string }[];
  recentMessages: { id: number; name: string; email: string; subject: string; created_at: string; is_read: number }[];
}

export default function DashboardPage() {
  const { t } = useLang();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>;
  if (!stats) return <p className="text-[var(--muted)]">{t("admin_error")}</p>;
  const cards = [
    { icon: FolderGit2, label: t("admin_dashboard_projects"), value: stats.projects, sub: `${stats.published} ${t("admin_dashboard_published")}`, href: "/admin/projects", color: "text-indigo-400 bg-indigo-500/10" },
    { icon: Award, label: t("admin_dashboard_skills"), value: stats.skills, sub: "", href: "/admin/skills", color: "text-cyan-400 bg-cyan-500/10" },
    { icon: Mail, label: t("admin_dashboard_messages"), value: stats.messages, sub: `${stats.unread} ${t("admin_dashboard_unread")}`, href: "/admin/messages", color: "text-purple-400 bg-purple-500/10" },
    { icon: ImageIcon, label: t("admin_media_count"), value: stats.media, sub: formatFileSize(stats.mediaSize), href: "/admin/media", color: "text-pink-400 bg-pink-500/10" },
  ];
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">{t("admin_dashboard_welcome")}</h1>
      <p className="text-[var(--muted)] mt-1">{t("admin_dashboard_subtitle")}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 glow-card">
            <span className={`inline-flex p-2.5 rounded-xl ${c.color}`}><c.icon size={20} /></span>
            <p className="text-3xl font-black mt-3">{c.value}</p>
            <p className="text-sm font-medium mt-1">{c.label}</p>
            {c.sub && <p className="text-xs text-[var(--muted)] mt-0.5">{c.sub}</p>}
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">{t("admin_recent_projects")}</h2>
            <Link href="/admin/projects" className="text-xs text-indigo-400 font-semibold">{t("admin_view_all")}</Link>
          </div>
          <div className="space-y-3">
            {stats.recentProjects.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="flex items-center justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0 hover:opacity-80">
                <span className="font-medium text-sm truncate">{p.title}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className={`badge border ${p.published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>{p.published ? t("admin_published") : t("admin_draft")}</span>
                  <span className="text-xs text-[var(--muted)]">{formatDate(p.updated_at)}</span>
                </span>
              </Link>
            ))}
            {stats.recentProjects.length === 0 && <p className="text-sm text-[var(--muted)]">{t("admin_empty")}</p>}
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">{t("admin_recent_messages")}</h2>
            <Link href="/admin/messages" className="text-xs text-indigo-400 font-semibold">{t("admin_view_all")}</Link>
          </div>
          <div className="space-y-3">
            {stats.recentMessages.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{m.name} {m.subject ? `— ${m.subject}` : ""}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{m.email}</p>
                </div>
                <span className={`badge border shrink-0 ${m.is_read ? "bg-slate-500/10 text-slate-400 border-slate-500/30" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"}`}>{m.is_read ? t("admin_read") : t("admin_unread")}</span>
              </div>
            ))}
            {stats.recentMessages.length === 0 && <p className="text-sm text-[var(--muted)]">{t("admin_empty")}</p>}
          </div>
        </div>
      </div>
      <div className="card p-6 mt-6">
        <h2 className="font-bold mb-4">{t("admin_quick_actions")}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects" className="btn-primary !py-2.5"><Plus size={16} /> {t("admin_dashboard_add_project")}</Link>
          <Link href="/admin/skills" className="btn-ghost !py-2.5"><Plus size={16} /> {t("admin_dashboard_add_skill")}</Link>
          <Link href="/admin/messages" className="btn-ghost !py-2.5"><Mail size={16} /> {t("admin_dashboard_view_messages")}</Link>
          <Link href="/" className="btn-ghost !py-2.5"><Eye size={16} /> {t("admin_dashboard_view_site")}</Link>
        </div>
        <div className="mt-6 pt-5 border-t border-[var(--border)] grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3"><Database size={18} className="text-indigo-400" /><div><p className="text-xs text-[var(--muted)]">{t("admin_db_size")}</p><p className="font-semibold">{formatFileSize(stats.dbSize)}</p></div></div>
          <div className="flex items-center gap-3"><HardDrive size={18} className="text-cyan-400" /><div><p className="text-xs text-[var(--muted)]">{t("admin_total_size")}</p><p className="font-semibold">{formatFileSize(stats.mediaSize)}</p></div></div>
          <div className="flex items-center gap-3"><FolderGit2 size={18} className="text-purple-400" /><div><p className="text-xs text-[var(--muted)]">{t("admin_experience")}</p><p className="font-semibold">{stats.experience}</p></div></div>
        </div>
      </div>
    </div>
  );
}
