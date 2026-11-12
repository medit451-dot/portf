"use client";
import { Briefcase, Heart, User } from "lucide-react";
import { useLang } from "@/lib/i18n";
import Reveal from "./Reveal";
import type { Profile } from "@/lib/db";

export default function About({ profile }: { profile: Profile }) {
  const { t } = useLang();
  let stats: Record<string, number> = {};
  try { stats = JSON.parse(profile.stats || "{}"); } catch {}
  return (
    <section id="about" className="py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">{t("nav_about")}</p>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">{t("about_title")}</h2>
          <p className="text-[var(--muted)] mt-2">{t("about_subtitle")}</p>
        </Reveal>
        <div className="mt-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <Reveal delay={80}>
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.name} className="w-full max-w-sm aspect-square object-cover rounded-3xl border border-[var(--border)] shadow-xl mx-auto lg:mx-0" />
            ) : (
              <div className="w-full max-w-sm aspect-square rounded-3xl border border-[var(--border)] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-6xl font-black text-white mx-auto lg:mx-0"><User size={80} /></div>
            )}
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[var(--muted)] leading-relaxed whitespace-pre-line">{profile.about_text || profile.bio}</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="card p-5 glow-card">
                <Briefcase className="text-indigo-400 mb-3" size={22} />
                <h3 className="font-bold text-sm">{t("about_specialization")}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{profile.specialization || "—"}</p>
              </div>
              <div className="card p-5 glow-card">
                <Heart className="text-pink-400 mb-3" size={22} />
                <h3 className="font-bold text-sm">{t("about_interests")}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{profile.interests || "—"}</p>
              </div>
            </div>
            {(stats.projects || stats.years || stats.clients || stats.awards) ? (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[[stats.projects, t("about_projects")], [stats.years, t("about_years")], [stats.clients, t("about_clients")], [stats.awards, t("about_awards")]].filter(([v]) => v != null).map(([v, label]) => (
                  <div key={label as string} className="card p-4 text-center">
                    <p className="text-2xl font-black text-gradient">{v}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
