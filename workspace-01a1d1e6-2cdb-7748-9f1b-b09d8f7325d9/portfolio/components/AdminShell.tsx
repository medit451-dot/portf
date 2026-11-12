"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderGit2, Award, User, Briefcase, Mail, Image as ImageIcon, Settings, Shield, ExternalLink, LogOut, Menu, X, Globe } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useLang } from "@/lib/i18n";
import { useToast } from "./Toast";

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/admin", icon: LayoutDashboard, label: t("admin_dashboard") },
    { href: "/admin/projects", icon: FolderGit2, label: t("admin_projects") },
    { href: "/admin/skills", icon: Award, label: t("admin_skills") },
    { href: "/admin/experience", icon: Briefcase, label: t("admin_experience") },
    { href: "/admin/messages", icon: Mail, label: t("admin_messages") },
    { href: "/admin/media", icon: ImageIcon, label: t("admin_media") },
    { href: "/admin/profile", icon: User, label: t("admin_profile") },
    { href: "/admin/settings", icon: Settings, label: t("admin_settings") },
    { href: "/admin/security", icon: Shield, label: t("admin_security_settings") },
  ];
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };
  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-[var(--border)]">
        <p className="font-black text-lg">{t("admin_dashboard")}</p>
        <p className="text-xs text-[var(--muted)] truncate mt-0.5">{email}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}>
              <l.icon size={18} /> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"><ExternalLink size={18} /> {t("admin_view_site")}</Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10"><LogOut size={18} /> {t("admin_logout")}</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--surface)] border-r border-[var(--border)]">{sidebar}</aside>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 glass border-b border-[var(--border)] px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg border border-[var(--border)]" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={20} /></button>
            <span className="font-bold text-sm hidden sm:block">{t("admin_secure")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[var(--border)] text-xs font-bold hover:border-indigo-500"><Globe size={16} /> {t("lang_label")}</button>
            <ThemeToggle />
            <button onClick={logout} className="p-2 rounded-lg border border-[var(--border)] text-red-400 hover:border-red-500" aria-label={t("admin_logout")}><LogOut size={18} /></button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
