"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { PageHeader, Field, ConfirmDelete, EmptyState } from "@/components/admin/AdminUI";
import { formatDate } from "@/lib/utils";

interface Project {
  id: number; slug: string; title: string; short_desc: string; full_desc: string; cover: string; gallery: string; tech: string;
  category: string; github_url: string; live_url: string; date: string; status: string; published: number; created_at: string; updated_at: string;
}

const emptyForm = { title: "", slug: "", short_desc: "", full_desc: "", cover: "", gallery: "", tech: "", category: "Web", github_url: "", live_url: "", date: "", status: "completed", published: true };

export default function AdminProjectsPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/projects").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => push("error", t("admin_error"))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    let tech: string[] = []; let gallery: string[] = [];
    try { tech = JSON.parse(p.tech || "[]"); } catch {}
    try { gallery = JSON.parse(p.gallery || "[]"); } catch {}
    setForm({ title: p.title, slug: p.slug, short_desc: p.short_desc, full_desc: p.full_desc, cover: p.cover, gallery: gallery.join(", "), tech: tech.join(", "), category: p.category, github_url: p.github_url, live_url: p.live_url, date: p.date, status: p.status, published: !!p.published });
    setModal(true);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { push("error", t("admin_required")); return; }
    setSaving(true);
    try {
      const payload = { ...form, tech: form.tech.split(",").map((s) => s.trim()).filter(Boolean), gallery: form.gallery.split(",").map((s) => s.trim()).filter(Boolean) };
      const res = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("admin_error"));
      push("success", editing ? t("admin_updated") : t("admin_created"));
      setModal(false);
      load();
    } catch (err) { push("error", err instanceof Error ? err.message : t("admin_error")); }
    finally { setSaving(false); }
  };
  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("admin_error"));
      push("success", t("admin_deleted"));
      setDeleteTarget(null);
      load();
    } catch { push("error", t("admin_error")); }
    finally { setDeleting(false); }
  };
  const filtered = items.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title={t("admin_projects_title")} subtitle={t("admin_projects_subtitle")} action={<button onClick={openAdd} className="btn-primary !py-2.5"><Plus size={16} /> {t("admin_add")}</button>} />
      <div className="relative max-w-md mb-5">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input className="input pl-10" placeholder={t("admin_search")} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>
        : filtered.length === 0 ? <EmptyState text={t("admin_no_results")} />
        : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                  <th className="p-4 font-semibold">{t("admin_title")}</th>
                  <th className="p-4 font-semibold">{t("admin_category")}</th>
                  <th className="p-4 font-semibold">{t("admin_status")}</th>
                  <th className="p-4 font-semibold">{t("admin_date_col")}</th>
                  <th className="p-4 font-semibold text-right">{t("admin_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.cover ? <img src={p.cover} alt="" className="w-12 h-9 object-cover rounded-lg border border-[var(--border)]" /> : <span className="w-12 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--muted)]">{t("admin_no_image")}</span>}
                        <div className="min-w-0"><p className="font-semibold truncate">{p.title}</p><p className="text-xs text-[var(--muted)] truncate">/{p.slug}</p></div>
                      </div>
                    </td>
                    <td className="p-4"><span className="badge bg-[var(--surface-2)] border border-[var(--border)]">{p.category}</span></td>
                    <td className="p-4"><span className={`badge border ${p.published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>{p.published ? t("admin_published") : t("admin_draft")}</span></td>
                    <td className="p-4 text-[var(--muted)]">{formatDate(p.updated_at)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1.5">
                        <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_open")}><ExternalLink size={15} /></a>
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_edit")}><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg border border-[var(--border)] text-red-400 hover:border-red-500" aria-label={t("admin_delete")}><Trash2 size={15} /></button>
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
          <Field label={`${t("admin_title")} *`}><input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required /></Field>
          <Field label={t("admin_slug")} hint={t("admin_slug_hint")}><input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("admin_category")} hint={t("admin_category_hint")}><input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} /></Field>
            <Field label={t("admin_status")}>
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="completed">{t("admin_status_completed")}</option>
                <option value="in_progress">{t("admin_status_in_progress")}</option>
                <option value="archived">{t("admin_status_archived")}</option>
              </select>
            </Field>
          </div>
          <Field label={t("admin_short_desc")}><textarea className="input min-h-[80px]" value={form.short_desc} onChange={(e) => set("short_desc", e.target.value)} /></Field>
          <Field label={t("admin_full_desc")}><textarea className="input min-h-[140px]" value={form.full_desc} onChange={(e) => set("full_desc", e.target.value)} /></Field>
          <Field label={t("admin_cover")} hint={t("admin_cover_hint")}><input className="input" value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://..." /></Field>
          <Field label={t("admin_gallery")} hint={t("admin_gallery_hint")}><textarea className="input min-h-[70px]" value={form.gallery} onChange={(e) => set("gallery", e.target.value)} /></Field>
          <Field label={t("admin_tech")} hint={t("admin_tech_hint")}><input className="input" value={form.tech} onChange={(e) => set("tech", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("admin_github")}><input className="input" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} placeholder="https://github.com/..." /></Field>
            <Field label={t("admin_live")}><input className="input" value={form.live_url} onChange={(e) => set("live_url", e.target.value)} placeholder="https://..." /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <Field label={t("admin_date")}><input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
            <label className="flex items-center gap-2.5 text-sm pb-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              {t("admin_published")}
            </label>
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
