"use client";
import Link from "next/link";
import { Github, Linkedin, Send, MessageCircle, Heart } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Profile } from "@/lib/db";

export default function Footer({ profile, logoText = "medit" }: { profile: Profile; logoText?: string }) {
  const { t } = useLang();
  const year = new Date().getFullYear();
  const socials = [
    { href: profile.github, icon: Github, label: "GitHub" },
    { href: profile.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: profile.telegram, icon: Send, label: "Telegram" },
    { href: profile.discord, icon: MessageCircle, label: "Discord" },
  ].filter((s) => s.href);
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="min-w-9 h-9 px-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm">{logoText || "medit"}</span>
          <div>
            <p className="font-semibold text-sm">{profile.name}</p>
            <p className="text-xs text-[var(--muted)]">{profile.title}</p>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
          <Link href="/#about" className="hover:text-[var(--text)]">{t("nav_about")}</Link>
          <Link href="/#skills" className="hover:text-[var(--text)]">{t("nav_skills")}</Link>
          <Link href="/projects" className="hover:text-[var(--text)]">{t("nav_projects")}</Link>
          <Link href="/#experience" className="hover:text-[var(--text)]">{t("nav_experience")}</Link>
          <Link href="/contact" className="hover:text-[var(--text)]">{t("nav_contact")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500 hover:text-indigo-400 transition-colors"><s.icon size={17} /></a>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)] flex items-center justify-center gap-1.5">
        <span>© {year} {profile.name}. {t("footer_rights")}</span>
        <span className="hidden sm:inline">· {t("footer_made")} <Heart size={12} className="inline text-red-400" fill="currentColor" /></span>
      </div>
    </footer>
  );
}
