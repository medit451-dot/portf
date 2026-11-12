"use client";
import { useEffect, useRef, useState } from "react";
import * as icons from "lucide-react";
import { useLang } from "@/lib/i18n";
import Reveal from "./Reveal";
import type { Skill } from "@/lib/db";

function SkillIcon({ name }: { name: string }) {
  const map: Record<string, string> = {
    atom: "Atom", code: "Code2", zap: "Zap", palette: "Palette", layers: "Layers", server: "Server",
    database: "Database", gamepad: "Gamepad2", "git-branch": "GitBranch", box: "Box", terminal: "Terminal",
    "pen-tool": "PenTool", "share-2": "Share2", cpu: "Cpu", globe: "Globe", smartphone: "Smartphone",
    cloud: "Cloud", shield: "Shield", wrench: "Wrench", settings: "Settings", star: "Star",
  };
  const key = map[name] || "Code2";
  const Icon = ((icons as unknown as Record<string, import("lucide-react").LucideIcon>)[key] || icons.Code2) as import("lucide-react").LucideIcon;
  return <Icon size={18} />;
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const categories = Array.from(new Set(skills.map((s) => s.category)));
  return (
    <section id="skills" className="py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <Reveal>
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">{t("nav_skills")}</p>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">{t("skills_title")}</h2>
          <p className="text-[var(--muted)] mt-2">{t("skills_subtitle")}</p>
        </Reveal>
        <div className="mt-10 space-y-10">
          {categories.map((cat, ci) => (
            <Reveal key={cat} delay={ci * 60}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="w-2 h-6 rounded bg-gradient-to-b from-indigo-500 to-cyan-400 inline-block" />{cat}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.filter((s) => s.category === cat).map((s) => (
                  <div key={s.id} className="card p-5 glow-card">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0"><SkillIcon name={s.icon} /></span>
                        <span className="font-semibold truncate">{s.name}</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-400 shrink-0">{s.level}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000" style={{ width: visible ? `${s.level}%` : "0%" }} />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-2">{t("skills_level")}: {s.level}/100</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
