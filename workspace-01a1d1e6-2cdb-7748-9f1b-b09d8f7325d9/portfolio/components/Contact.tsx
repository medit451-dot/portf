"use client";
import { useState } from "react";
import { Mail, MapPin, Send, Github, Linkedin, MessageCircle, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "./Toast";
import Reveal from "./Reveal";
import type { Profile } from "@/lib/db";

export default function Contact({ profile }: { profile: Profile }) {
  const { t } = useLang();
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { push("error", t("admin_required")); return; }
    setSending(true);
    try {
      const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("contact_error"));
      setSent(true);
      push("success", t("contact_success"));
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      push("error", err instanceof Error ? err.message : t("contact_error"));
    } finally { setSending(false); }
  };
  const socials = [
    { href: profile.github, icon: Github, label: "GitHub" },
    { href: profile.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: profile.telegram, icon: Send, label: "Telegram" },
    { href: profile.discord, icon: MessageCircle, label: "Discord" },
  ].filter((s) => s.href);
  return (
    <section id="contact" className="py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">{t("nav_contact")}</p>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">{t("contact_title")}</h2>
          <p className="text-[var(--muted)] mt-2">{t("contact_subtitle")}</p>
        </Reveal>
        <div className="mt-10 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
          <Reveal delay={80}>
            <div className="space-y-4">
              <a href={`mailto:${profile.email}`} className="card p-5 flex items-center gap-4 glow-card">
                <span className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><Mail size={20} /></span>
                <div><p className="text-xs text-[var(--muted)]">{t("contact_email_label")}</p><p className="font-semibold text-sm break-all">{profile.email}</p></div>
              </a>
              {profile.location && (
                <div className="card p-5 flex items-center gap-4 glow-card">
                  <span className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><MapPin size={20} /></span>
                  <div><p className="text-xs text-[var(--muted)]">{t("contact_location_label")}</p><p className="font-semibold text-sm">{profile.location}</p></div>
                </div>
              )}
              {profile.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noreferrer" className="card p-5 flex items-center gap-4 glow-card">
                  <span className="p-3 rounded-xl bg-purple-500/10 text-purple-400"><FileText size={20} /></span>
                  <div><p className="font-semibold text-sm">{t("contact_resume")}</p></div>
                </a>
              )}
              {socials.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs text-[var(--muted)] mb-3">{t("contact_socials")}</p>
                  <div className="flex gap-2">
                    {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="p-2.5 rounded-xl border border-[var(--border)] hover:border-indigo-500 hover:text-indigo-400 transition-colors"><s.icon size={18} /></a>)}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={160}>
            <form onSubmit={submit} className="card p-6 sm:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{t("contact_name")} *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{t("contact_email")} *</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{t("contact_subject")}</label>
                <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{t("contact_message")} *</label>
                <textarea className="input min-h-[140px] resize-y" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto">
                {sending ? <><Loader2 size={17} className="animate-spin" /> {t("contact_sending")}</> : sent ? <><CheckCircle2 size={17} /> {t("contact_success")}</> : <><Send size={17} /> {t("contact_send")}</>}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
