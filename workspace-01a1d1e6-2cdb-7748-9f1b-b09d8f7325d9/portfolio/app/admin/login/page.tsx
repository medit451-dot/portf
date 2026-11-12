"use client";
import { useState } from "react";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [email, setEmail] = useState("medit451@gmail.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 401 ? t("admin_login_error") : data.error || t("admin_login_error"));
      push("success", t("admin_toast_success"));
      // Use a full navigation so the freshly-set httpOnly cookie is included
      // even in the preview's reverse-proxy environment.
      window.location.assign("/admin");
    } catch (err) {
      push("error", err instanceof Error ? err.message : t("admin_login_error"));
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="relative w-full max-w-md">
        <div className="card p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400"><Shield size={24} /></span>
            <div>
              <h1 className="text-xl font-black">{t("admin_login_title")}</h1>
              <p className="text-xs text-[var(--muted)]">{t("admin_secure")}</p>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)] mt-4 mb-6">{t("admin_login_subtitle")}</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{t("admin_login_email")}</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{t("admin_login_password")}</label>
              <div className="relative">
                <input type={show ? "text" : "password"} className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-label="Toggle password">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 size={17} className="animate-spin" /> {t("admin_loading")}</> : t("admin_login_btn")}
            </button>
          </form>
          <p className="text-xs text-[var(--muted)] mt-6 border-t border-[var(--border)] pt-4">
            <span className="font-semibold">{t("admin_forgot")}</span> {t("admin_forgot_text")}
          </p>
        </div>
      </div>
    </div>
  );
}
