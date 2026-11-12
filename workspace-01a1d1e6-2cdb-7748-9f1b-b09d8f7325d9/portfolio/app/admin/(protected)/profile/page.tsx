"use client";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { PageHeader, Field } from "@/components/admin/AdminUI";

interface Profile {
  name: string; title: string; subtitle: string; bio: string; about_text: string; specialization: string; interests: string;
  avatar_url: string; email: string; location: string; github: string; linkedin: string; discord: string; telegram: string; resume_url: string; stats: string;
}

export default function AdminProfilePage() {
  const { t } = useLang();
  const { push } = useToast();
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setForm).catch(() => push("error", t("admin_error")));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.title.trim()) { push("error", t("admin_required")); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("admin_error"));
      push("success", t("admin_saved"));
    } catch (err) { push("error", err instanceof Error ? err.message : t("admin_error")); }
    finally { setSaving(false); }
  };
  const set = (k: keyof Profile, v: string) => setForm((f) => f ? { ...f, [k]: v } : f);

  if (!form) return <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>;

  return (
    <div>
      <PageHeader title={t("admin_profile_title")} subtitle={t("admin_profile_subtitle")} />
      <form onSubmit={save} className="card p-6 sm:p-8 space-y-6 max-w-3xl">
        <div>
          <h2 className="font-bold mb-4">{t("admin_basic")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={`${t("admin_name_label")} *`}><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
            <Field label={`${t("admin_title_label")} *`}><input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required /></Field>
          </div>
          <div className="mt-4"><Field label={t("admin_subtitle_label")}><input className="input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></Field></div>
          <div className="mt-4"><Field label={t("admin_bio")}><textarea className="input min-h-[90px]" value={form.bio} onChange={(e) => set("bio", e.target.value)} /></Field></div>
          <div className="mt-4"><Field label={t("admin_about")}><textarea className="input min-h-[140px]" value={form.about_text} onChange={(e) => set("about_text", e.target.value)} /></Field></div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label={t("admin_specialization")}><input className="input" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} /></Field>
            <Field label={t("admin_interests")}><input className="input" value={form.interests} onChange={(e) => set("interests", e.target.value)} /></Field>
          </div>
          <div className="mt-4"><Field label={t("admin_stats")} hint={t("admin_stats_hint")}><input className="input" value={form.stats} onChange={(e) => set("stats", e.target.value)} placeholder='{"projects":24,"years":4,"clients":12,"awards":3}' /></Field></div>
        </div>
        <div className="border-t border-[var(--border)] pt-6">
          <h2 className="font-bold mb-4">{t("admin_contacts")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("admin_email_label")}><input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label={t("admin_location")}><input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
            <Field label={t("admin_github_label")}><input className="input" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/..." /></Field>
            <Field label={t("admin_linkedin")}><input className="input" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/..." /></Field>
            <Field label={t("admin_telegram")}><input className="input" value={form.telegram} onChange={(e) => set("telegram", e.target.value)} placeholder="https://t.me/..." /></Field>
            <Field label={t("admin_discord")}><input className="input" value={form.discord} onChange={(e) => set("discord", e.target.value)} placeholder="https://discord.com/..." /></Field>
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-6">
          <h2 className="font-bold mb-4">{t("admin_advanced")}</h2>
          <div className="space-y-4">
            <Field label={t("admin_avatar")} hint={t("admin_avatar_hint")}><input className="input" value={form.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} placeholder="/uploads/photo.jpg or https://..." /></Field>
            {form.avatar_url && <img src={form.avatar_url} alt="Avatar preview" className="w-24 h-24 object-cover rounded-2xl border border-[var(--border)]" />}
            <Field label={t("admin_resume")} hint={t("admin_resume_hint")}><input className="input" value={form.resume_url} onChange={(e) => set("resume_url", e.target.value)} placeholder="/uploads/resume.pdf" /></Field>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {t("admin_save")}</button>
        </div>
      </form>
    </div>
  );
}
