"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, LogIn, ShieldCheck, UserRound } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { openAdminWelcome, openWelcome } from "./WelcomeGate";
import ThemeToggle from "./ThemeToggle";
import { useLang } from "@/lib/i18n";

export default function Navbar({ logoText = "medit", siteName = "" }: { logoText?: string; siteName?: string }) {
  const { t, lang, setLang } = useLang();
  const showSiteName = !!siteName && siteName.trim().toLowerCase() !== (logoText || "").trim().toLowerCase();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [firebaseAuthed, setFirebaseAuthed] = useState(false);
  useEffect(() => {
    const refreshAdminSession = () => {
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then((d) => setAuthed(!!d.authenticated)).catch(() => {});
    };
    refreshAdminSession();
    const onAdminAuth = () => refreshAdminSession();
    window.addEventListener("medit:admin-auth", onAdminAuth);

    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      if (auth) unsubscribe = onAuthStateChanged(auth, (user) => setFirebaseAuthed(!!user));
    } catch {
      // Firebase errors are displayed by the welcome/auth dialog.
    }
    return () => {
      window.removeEventListener("medit:admin-auth", onAdminAuth);
      unsubscribe?.();
    };
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "/#home", label: t("nav_home") },
    { href: "/#about", label: t("nav_about") },
    { href: "/#skills", label: t("nav_skills") },
    { href: "/projects", label: t("nav_projects") },
    { href: "/#experience", label: t("nav_experience") },
    { href: "/contact", label: t("nav_contact") },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "glass border-b border-[var(--border)] shadow-lg" : ""}`}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="min-w-9 h-9 px-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/30">{logoText || "medit"}</span>
          {showSiteName && <span className="hidden sm:block font-semibold text-sm truncate max-w-[180px]">{siteName}</span>}
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} className="px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">{l.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[var(--border)] text-xs font-bold hover:border-indigo-500 transition-colors" aria-label="Language">
            <Globe size={16} /> {t("lang_label")}
          </button>
          {!authed && (
            <button onClick={openAdminWelcome} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-amber-500/40 text-xs font-bold text-amber-400 hover:border-amber-400 transition-colors" aria-label={t("nav_admin")}>
              <ShieldCheck size={15} /> <span className="hidden sm:inline">{t("nav_admin")}</span>
            </button>
          )}
          {authed ? (
            <Link href="/admin" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
              <ShieldCheck size={15} /> <span className="hidden sm:inline">{t("nav_admin")}</span>
            </Link>
          ) : firebaseAuthed ? (
            <button onClick={openWelcome} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-emerald-500/40 text-xs font-bold text-emerald-400 hover:border-emerald-400 transition-colors" aria-label={t("auth_account")}>
              <UserRound size={15} /> <span className="hidden sm:inline">{t("auth_account")}</span>
            </button>
          ) : (
            <button onClick={openWelcome} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-bold hover:border-indigo-500 hover:text-indigo-400 transition-colors" aria-label={t("nav_login")}>
              <LogIn size={15} /> <span className="hidden sm:inline">{t("nav_login")}</span>
            </button>
          )}
          <ThemeToggle />
          <button className="md:hidden p-2 rounded-lg border border-[var(--border)]" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </nav>
      {open && (
        <div className="md:hidden glass border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--surface-2)]">{l.label}</Link>
          ))}
          {!authed && (
            <button onClick={() => { setOpen(false); openAdminWelcome(); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-400 hover:bg-[var(--surface-2)]">{t("nav_admin")}</button>
          )}
          {authed ? (
            <Link href="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-400 hover:bg-[var(--surface-2)]">{t("nav_admin")}</Link>
          ) : firebaseAuthed ? (
            <button onClick={() => { setOpen(false); openWelcome(); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-400 hover:bg-[var(--surface-2)]">{t("auth_account")}</button>
          ) : (
            <button onClick={() => { setOpen(false); openWelcome(); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-400 hover:bg-[var(--surface-2)]">{t("nav_login")}</button>
          )}
        </div>
      )}
    </header>
  );
}
