"use client";
import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { useLang } from "@/lib/i18n";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">{title}</h1>
        {subtitle && <p className="text-[var(--muted)] mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-[var(--muted)]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[var(--muted)] mt-1">{hint}</p>}
    </div>
  );
}

export function ConfirmDelete({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; loading?: boolean }) {
  const { t } = useLang();
  return (
    <Modal open={open} onClose={onClose} title={t("admin_confirm_title")}>
      <p className="text-sm text-[var(--muted)]">{t("admin_confirm_text")}</p>
      <div className="flex gap-3 mt-6 justify-end">
        <button onClick={onClose} className="btn-ghost !py-2.5">{t("admin_no_cancel")}</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger !py-2.5">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {t("admin_yes_delete")}
        </button>
      </div>
    </Modal>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="card p-10 text-center text-[var(--muted)] text-sm">{text}</div>;
}
