"use client";
import { useState } from "react";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { PageHeader, Field } from "@/components/admin/AdminUI";

export default function AdminSecurityPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) { push("error", t("admin_password_min")); return; }
    if (next !== confirm) { push("error", t("admin_required")); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("admin_error"));
      push("success", t("admin_password_changed"));
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) { push("error", err instanceof Error ? err.message : t("admin_error")); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title={t("admin_security_settings")} subtitle={t("admin_security_text")} />
      <div className="card p-6 sm:p-8 max-w-xl">
        <h2 className="font-bold flex items-center gap-2 mb-5"><KeyRound size={18} className="text-indigo-400" /> {t("admin_change_password")}</h2>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("admin_current")}><input type="password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" /></Field>
          <Field label={t("admin_new_password")} hint={t("admin_password_min")}><input type="password" className="input" value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" /></Field>
          <Field label={t("admin_new_password")}><input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" /></Field>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} {t("admin_save")}</button>
        </form>
      </div>
      <div className="card p-6 sm:p-8 max-w-xl mt-6">
        <h2 className="font-bold mb-3">{t("admin_security")}</h2>
        <ul className="text-sm text-[var(--muted)] space-y-2 list-disc pl-5">
          <li>{t("admin_security_text")}</li>
          <li>SESSION_SECRET — {t("admin_required_field")}</li>
          <li>bcrypt · httpOnly cookie · 7 days</li>
        </ul>
      </div>
    </div>
  );
}
