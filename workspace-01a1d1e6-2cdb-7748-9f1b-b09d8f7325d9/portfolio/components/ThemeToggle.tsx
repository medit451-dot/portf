"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function ThemeToggle() {
  const { t } = useLang();
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };
  return (
    <button onClick={toggle} aria-label={dark ? t("theme_light") : t("theme_dark")} className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500 transition-colors">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
