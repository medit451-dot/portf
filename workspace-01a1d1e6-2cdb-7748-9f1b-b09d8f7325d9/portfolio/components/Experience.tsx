"use client";
import { useState } from "react";
import { Briefcase, GraduationCap, Award, Trophy, FlaskConical, type LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import Reveal from "./Reveal";
import type { ExperienceItem } from "@/lib/db";

const TYPE_ICON: Record<string, LucideIcon> = {
  work: Briefcase, internship: FlaskConical, education: GraduationCap, certificate: Award, achievement: Trophy,
};

export default function Experience({ items }: { items: ExperienceItem[] }) {
  const { t } = useLang();
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: t("admin_filter_all") },
    { id: "work", label: t("exp_work") },
    { id: "internship", label: t("exp_internship") },
    { id: "education", label: t("exp_education") },
    { id: "certificate", label: t("exp_certificate") },
    { id: "achievement", label: t("exp_achievement") },
  ];
  const filtered = items.filter((i) => tab === "all" || i.type === tab);
  return (
    <section id="experience" className="py-20 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">{t("nav_experience")}</p>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">{t("exp_title")}</h2>
          <p className="text-[var(--muted)] mt-2">{t("exp_subtitle")}</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((x) => (
              <button key={x.id} onClick={() => setTab(x.id)} className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${tab === x.id ? "bg-indigo-600 border-indigo-600 text-white" : "border-[var(--border)] text-[var(--muted)] hover:border-indigo-500"}`}>{x.label}</button>
            ))}
          </div>
        </Reveal>
        <div className="mt-10 relative timeline-line pl-10 space-y-6">
          {filtered.map((item, i) => {
            const Icon = TYPE_ICON[item.type] || Briefcase;
            return (
              <Reveal key={item.id} delay={i * 50}>
                <div className="relative card p-5 glow-card">
                  <span className="absolute -left-[52px] top-5 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"><Icon size={16} /></span>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      {item.org && <p className="text-sm text-indigo-400 font-medium">{item.org}</p>}
                    </div>
                    {item.period && <span className="badge bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)]">{item.period}</span>}
                  </div>
                  {item.description && <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed whitespace-pre-line">{item.description}</p>}
                </div>
              </Reveal>
            );
          })}
          {filtered.length === 0 && <p className="text-[var(--muted)]">{t("admin_empty")}</p>}
        </div>
      </div>
    </section>
  );
}
