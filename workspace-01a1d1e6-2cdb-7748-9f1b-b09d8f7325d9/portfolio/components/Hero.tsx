"use client";
import Link from "next/link";
import { ArrowRight, Mail, Github, Linkedin, Send, MessageCircle, ChevronDown, MapPin } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Profile } from "@/lib/db";

export default function Hero({ profile, settings }: { profile: Profile; settings: Record<string, string> }) {
  const { t } = useLang();
  let stats: Record<string, number> = {};
  try { stats = JSON.parse(profile.stats || "{}"); } catch {}
  const socials = [
    { href: profile.github, icon: Github, label: "GitHub" },
    { href: profile.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: profile.telegram, icon: Send, label: "Telegram" },
    { href: profile.discord, icon: MessageCircle, label: "Discord" },
  ].filter((s) => s.href);
  const initials = profile.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center w-full">
        <div>
          <div className="inline-flex items-center gap-2 badge border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {profile.title}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
            {(() => {
              const parts = profile.name.trim().split(/\s+/);
              if (parts.length < 2) return <span className="text-gradient">{profile.name}</span>;
              return <>{parts[0]} <span className="text-gradient">{parts.slice(1).join(" ")}</span></>;
            })()}
          </h1>
          {profile.subtitle && <p className="mt-4 text-lg sm:text-xl text-[var(--muted)]">{profile.subtitle}</p>}
          {profile.bio && <p className="mt-4 text-[var(--muted)] leading-relaxed max-w-xl">{profile.bio}</p>}
          {profile.location && <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]"><MapPin size={15} /> {profile.location}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects" className="btn-primary">{settings.hero_button_projects || t("hero_view_projects")} <ArrowRight size={17} /></Link>
            <Link href="/contact" className="btn-ghost"><Mail size={17} /> {settings.hero_button_contact || t("hero_contact")}</Link>
          </div>
          {socials.length > 0 && (
            <div className="mt-8 flex items-center gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="p-2.5 rounded-xl border border-[var(--border)] hover:border-indigo-500 hover:text-indigo-400 transition-colors"><s.icon size={18} /></a>
              ))}
            </div>
          )}
          {(stats.projects || stats.years || stats.clients || stats.awards) ? (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
              {[
                [stats.projects, t("about_projects")],
                [stats.years, t("about_years")],
                [stats.clients, t("about_clients")],
                [stats.awards, t("about_awards")],
              ].filter(([v]) => v != null).map(([v, label]) => (
                <div key={label as string} className="card p-4 text-center">
                  <p className="text-2xl font-black text-gradient">{v}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative animate-float-slow">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 blur-2xl" />
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.name} className="relative w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-[2rem] border border-[var(--border)] shadow-2xl" />
            ) : (
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[2rem] border border-[var(--border)] bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-7xl font-black text-white shadow-2xl">{initials}</div>
            )}
          </div>
        </div>
      </div>
      <a href="#about" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)]">
        {t("hero_scroll")} <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  );
}
