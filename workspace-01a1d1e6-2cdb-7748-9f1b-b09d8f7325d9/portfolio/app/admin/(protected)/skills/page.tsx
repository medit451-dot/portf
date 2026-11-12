"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { PageHeader, Field, ConfirmDelete, EmptyState } from "@/components/admin/AdminUI";

interface Skill { id: number; name: string; category: string; level: number; icon: string; sort_order: number; }
const emptyForm = { name: "", category: "Tools & Technologies", level: 80, icon: "code", sort_order: 0 };

export default function AdminSkillsPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/skills").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => push("error", t("admin_error"))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, sort_order: items.length }); setModal(true); };
  const openEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, category: s.category, level: s.level, icon: s.icon, sort_order: s.sort_order }); setModal(true); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { push("error", t("admin_required")); return; }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/skills/${editing.id}` : "/api/skills", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("admin_error"));
      push("success", editing ? t("admin_updated") : t("admin_created"));
      setModal(false); load();
    } catch (err) { push("error", err instanceof Error ? err.message : t("admin_error")); }
    finally { setSaving(false); }
  };
  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/skills/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("admin_error"));
      push("success", t("admin_deleted")); setDeleteTarget(null); load();
    } catch { push("error", t("admin_error")); }
    finally { setDeleting(false); }
  };
  const move = async (skill: Skill, dir: -1 | 1) => {
    const idx = items.findIndex((s) => s.id === skill.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    try {
      await fetch(`/api/skills/${skill.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: other.sort_order }) });
      await fetch(`/api/skills/${other.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: skill.sort_order }) });
      load();
    } catch { push("error", t("admin_error")); }
  };
  const filtered = items.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()));
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title={t("admin_skills_title")} subtitle={t("admin_skills_subtitle")} action={<button onClick={openAdd} className="btn-primary !py-2.5"><Plus size={16} /> {t("admin_add")}</button>} />
      <div className="relative max-w-md mb-5">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input className="input pl-10" placeholder={t("admin_search")} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>
        : filtered.length === 0 ? <EmptyState text={t("admin_no_results")} />
        : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                <th className="p-4 font-semibold">{t("admin_name")}</th><th className="p-4 font-semibold">{t("admin_category")}</th>
                <th className="p-4 font-semibold">{t("admin_level")}</th><th className="p-4 font-semibold">{t("admin_icon")}</th>
                <th className="p-4 font-semibold">{t("admin_sort")}</th><th className="p-4 font-semibold text-right">{t("admin_actions")}</th>
              </tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50">
                    <td className="p-4 font-semibold">{s.name}</td>
                    <td className="p-4 text-[var(--muted)]">{s.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${s.level}%` }} /></div>
                        <span className="text-xs font-bold text-indigo-400">{s.level}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--muted)]">{s.icon}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => move(s, -1)} className="p-1.5 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_move_up")}><ChevronUp size={15} /></button>
                        <button onClick={() => move(s, 1)} className="p-1.5 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_move_down")}><ChevronDown size={15} /></button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_edit")}><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-lg border border-[var(--border)] text-red-400 hover:border-red-500" aria-label={t("admin_delete")}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t("admin_edit") : t("admin_add")}>
        <form onSubmit={save} className="space-y-4">
          <Field label={`${t("admin_name")} *`}><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
          <Field label={t("admin_category")}><input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} /></Field>
          <Field label={`${t("admin_level")} (0–100)`}>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={form.level} onChange={(e) => set("level", Number(e.target.value))} className="flex-1 accent-indigo-600" />
              <input type="number" min={0} max={100} className="input w-20" value={form.level} onChange={(e) => set("level", Number(e.target.value))} />
            </div>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("admin_icon")} hint={t("admin_icon_hint")}><input className="input" value={form.icon} onChange={(e) => set("icon", e.target.value)} /></Field>
            <Field label={t("admin_sort")} hint={t("admin_sort_hint")}><input type="number" className="input" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost !py-2.5">{t("admin_cancel")}</button>
            <button type="submit" disabled={saving} className="btn-primary !py-2.5">{saving ? <Loader2 size={16} className="animate-spin" /> : null} {t("admin_save")}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={doDelete} loading={deleting} />
    </div>
  );
}
