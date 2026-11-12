"use client";
import { useEffect, useState } from "react";
import { Trash2, Loader2, MailOpen, Eye } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { PageHeader, ConfirmDelete, EmptyState } from "@/components/admin/AdminUI";
import { formatDate } from "@/lib/utils";

interface Msg { id: number; name: string; email: string; subject: string; message: string; is_read: number; ip: string; created_at: string; }

export default function AdminMessagesPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewing, setViewing] = useState<Msg | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Msg | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = (f = filter) => {
    setLoading(true);
    fetch(`/api/messages?filter=${f}`).then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => push("error", t("admin_error"))).finally(() => setLoading(false));
  };
  useEffect(() => { load(filter); }, [filter]);

  const markRead = async (m: Msg) => {
    try {
      await fetch(`/api/messages/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_read: 1 }) });
      setItems((prev) => prev.map((x) => x.id === m.id ? { ...x, is_read: 1 } : x));
      if (viewing?.id === m.id) setViewing({ ...m, is_read: 1 });
    } catch { push("error", t("admin_error")); }
  };
  const openView = (m: Msg) => { setViewing(m); if (!m.is_read) markRead(m); };
  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/messages/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("admin_error"));
      push("success", t("admin_deleted")); setDeleteTarget(null); load();
    } catch { push("error", t("admin_error")); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader title={t("admin_messages_title")} subtitle={t("admin_messages_subtitle")} />
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ id: "all", label: t("admin_filter_all") }, { id: "unread", label: t("admin_filter_unread") }, { id: "read", label: t("admin_filter_read") }].map((x) => (
          <button key={x.id} onClick={() => setFilter(x.id)} className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${filter === x.id ? "bg-indigo-600 border-indigo-600 text-white" : "border-[var(--border)] text-[var(--muted)] hover:border-indigo-500"}`}>{x.label}</button>
        ))}
      </div>
      {loading ? <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>
        : items.length === 0 ? <EmptyState text={t("admin_no_results")} />
        : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead><tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                <th className="p-4 font-semibold">{t("admin_from")}</th><th className="p-4 font-semibold">{t("admin_subject")}</th>
                <th className="p-4 font-semibold">{t("admin_date_col")}</th><th className="p-4 font-semibold">{t("admin_status")}</th>
                <th className="p-4 font-semibold text-right">{t("admin_actions")}</th>
              </tr></thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50 ${!m.is_read ? "bg-indigo-500/[0.04]" : ""}`}>
                    <td className="p-4"><p className="font-semibold">{m.name}</p><p className="text-xs text-[var(--muted)]">{m.email}</p></td>
                    <td className="p-4 max-w-[260px]"><p className="truncate">{m.subject || "—"}</p><p className="text-xs text-[var(--muted)] truncate">{m.message}</p></td>
                    <td className="p-4 text-[var(--muted)] whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td className="p-4"><span className={`badge border ${m.is_read ? "bg-slate-500/10 text-slate-400 border-slate-500/30" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"}`}>{m.is_read ? t("admin_read") : t("admin_unread")}</span></td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openView(m)} className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_preview")}><Eye size={15} /></button>
                        {!m.is_read && <button onClick={() => markRead(m)} className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_mark_read")}><MailOpen size={15} /></button>}
                        <button onClick={() => setDeleteTarget(m)} className="p-2 rounded-lg border border-[var(--border)] text-red-400 hover:border-red-500" aria-label={t("admin_delete")}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `${viewing.name} — ${viewing.subject || t("admin_subject")}` : ""}>
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><p className="text-xs text-[var(--muted)]">{t("admin_from")}</p><p className="font-semibold">{viewing.name}</p></div>
              <div><p className="text-xs text-[var(--muted)]">Email</p><a href={`mailto:${viewing.email}`} className="font-semibold text-indigo-400 break-all">{viewing.email}</a></div>
              <div><p className="text-xs text-[var(--muted)]">{t("admin_date_col")}</p><p className="font-semibold">{formatDate(viewing.created_at)}</p></div>
              {viewing.ip && <div><p className="text-xs text-[var(--muted)]">{t("admin_ip")}</p><p className="font-semibold">{viewing.ip}</p></div>}
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4 whitespace-pre-line leading-relaxed">{viewing.message}</div>
            <div className="flex gap-3 justify-end">
              <a href={`mailto:${viewing.email}?subject=Re: ${encodeURIComponent(viewing.subject || "")}`} className="btn-primary !py-2.5">{t("admin_open")}</a>
              <button onClick={() => setViewing(null)} className="btn-ghost !py-2.5">{t("admin_close")}</button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={doDelete} loading={deleting} />
    </div>
  );
}
