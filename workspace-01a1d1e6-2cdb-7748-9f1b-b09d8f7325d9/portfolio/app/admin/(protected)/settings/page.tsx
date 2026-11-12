"use client";
import { useEffect, useState } from "react";
import { Loader2, Save, Download, RefreshCcw, ShieldAlert } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { PageHeader, Field } from "@/components/admin/AdminUI";
import Modal from "@/components/Modal";

interface Settings {
  site_name: string; site_description: string; logo_text: string; favicon: string; og_image: string; seo_title: string; seo_description: string;
  show_about: string; show_skills: string; show_projects: string; show_experience: string; show_contact: string;
  hero_button_projects: string; hero_button_contact: string;
}

const empty: Settings = { site_name: "", site_description: "", logo_text: "", favicon: "", og_image: "", seo_title: "", seo_description: "", show_about: "1", show_skills: "1", show_projects: "1", show_experience: "1", show_contact: "1", hero_button_projects: "", hero_button_contact: "" };

export default function AdminSettingsPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setForm({ ...empty, ...d })).catch(() => push("error", t("admin_error")));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("admin_error"));
      push("success", t("admin_saved"));
    } catch (err) { push("error", err instanceof Error ? err.message : t("admin_error")); }
    finally { setSaving(false); }
  };
  const set = (k: keyof Settings, v: string) => setForm((f) => f ? { ...f, [k]: v } : f);
  const toggle = (k: keyof Settings) => set(k, form && form[k] === "1" ? "0" : "1");

  const doReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (!res.ok) throw new Error(t("admin_error"));
      push("success", t("admin_reset_done"));
      setResetOpen(false);
      window.location.reload();
    } catch { push("error", t("admin_error")); }
    finally { setResetting(false); }
  };

  if (!form) return <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>;

  const sections: { key: keyof Settings; label: string }[] = [
    { key: "show_about", label: t("admin_about_section") },
    { key: "show_skills", label: t("admin_skills_section") },
    { key: "show_projects", label: t("admin_projects_section") },
    { key: "show_experience", label: t("admin_experience_section") },
    { key: "show_contact", label: t("admin_contact_section") },
  ];

  return (
    <div>
      <PageHeader title={t("admin_settings_title")} subtitle={t("admin_settings_subtitle")} />
      <form onSubmit={save} className="space-y-6 max-w-3xl">
        <div className="card p-6 sm:p-8 space-y-4">
          <h2 className="font-bold">{t("admin_basic")}</h2>
          <Field label={t("admin_site_name")}><input className="input" value={form.site_name} onChange={(e) => set("site_name", e.target.value)} /></Field>
          <Field label={t("admin_site_desc")}><textarea className="input min-h-[80px]" value={form.site_description} onChange={(e) => set("site_description", e.target.value)} /></Field>
          <Field label={t("admin_logo")} hint={t("admin_logo_hint")}><input className="input" value={form.logo_text} onChange={(e) => set("logo_text", e.target.value)} /></Field>
          <Field label={t("admin_favicon")}><input className="input" value={form.favicon} onChange={(e) => set("favicon", e.target.value)} placeholder="/uploads/favicon.png" /></Field>
        </div>
        <div className="card p-6 sm:p-8 space-y-4">
          <h2 className="font-bold">{t("admin_hero_title")}</h2>
          <p className="text-xs text-[var(--muted)]">{t("admin_hero_subtitle")}</p>
          <Field label={t("admin_hero_btn_projects")}><input className="input" value={form.hero_button_projects} onChange={(e) => set("hero_button_projects", e.target.value)} /></Field>
          <Field label={t("admin_hero_btn_contact")}><input className="input" value={form.hero_button_contact} onChange={(e) => set("hero_button_contact", e.target.value)} /></Field>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="font-bold mb-1">{t("admin_show_sections")}</h2>
          <p className="text-xs text-[var(--muted)] mb-4">{t("admin_sections_hint")}</p>
          <div className="space-y-3">
            {sections.map((s) => (
              <label key={s.key} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] px-4 py-3 cursor-pointer hover:border-indigo-500/60">
                <span className="text-sm font-medium">{s.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">{form[s.key] === "1" ? t("admin_on") : t("admin_off")}</span>
                  <button type="button" onClick={() => toggle(s.key)} aria-label={s.label} className={`w-11 h-6 rounded-full p-1 transition-colors ${form[s.key] === "1" ? "bg-indigo-600" : "bg-[var(--surface-2)] border border-[var(--border)]"}`}>
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${form[s.key] === "1" ? "translate-x-5" : ""}`} />
                  </button>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="card p-6 sm:p-8 space-y-4">
          <h2 className="font-bold">{t("admin_seo")}</h2>
          <Field label={t("admin_seo_title")}><input className="input" value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></Field>
          <Field label={t("admin_seo_desc")}><textarea className="input min-h-[80px]" value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></Field>
          <Field label={t("admin_og_image")}><input className="input" value={form.og_image} onChange={(e) => set("og_image", e.target.value)} placeholder="/uploads/og.jpg" /></Field>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {t("admin_save")}</button>
        </div>
      </form>
      <div className="card p-6 sm:p-8 mt-6 max-w-3xl">
        <h2 className="font-bold mb-4">{t("admin_backup")}</h2>
        <p className="text-sm text-[var(--muted)] mb-4">{t("admin_backup_hint")}</p>
        <div className="flex flex-wrap gap-3">
          <a href="/api/admin/backup" className="btn-ghost !py-2.5"><Download size={16} /> {t("admin_download_db")}</a>
          <a href="/api/admin/export" className="btn-ghost !py-2.5"><Download size={16} /> {t("admin_download_json")}</a>
        </div>
      </div>
      <div className="card p-6 sm:p-8 mt-6 max-w-3xl border-red-500/30">
        <h2 className="font-bold mb-2 flex items-center gap-2 text-red-400"><ShieldAlert size={18} /> {t("admin_danger_zone")}</h2>
        <p className="text-sm text-[var(--muted)] mb-4">{t("admin_reset_confirm")}</p>
        <button onClick={() => setResetOpen(true)} className="btn-danger !py-2.5"><RefreshCcw size={16} /> {t("admin_reset_demo")}</button>
      </div>
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title={t("admin_danger_zone")}>
        <p className="text-sm text-[var(--muted)]">{t("admin_reset_confirm")}</p>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setResetOpen(false)} className="btn-ghost !py-2.5">{t("admin_no_cancel")}</button>
          <button onClick={doReset} disabled={resetting} className="btn-danger !py-2.5">{resetting ? <Loader2 size={16} className="animate-spin" /> : null} {t("admin_yes_delete")}</button>
        </div>
      </Modal>
    </div>
  );
}
