"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2, FileText, Copy, Check, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { PageHeader, ConfirmDelete, EmptyState } from "@/components/admin/AdminUI";
import { formatFileSize, formatDate } from "@/lib/utils";

interface Media { id: number; filename: string; path: string; size: number; mime: string; created_at: string; }

export default function AdminMediaPage() {
  const { t } = useLang();
  const { push } = useToast();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/media").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => push("error", t("admin_error"))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("file", f));
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("admin_error"));
      push("success", t("admin_uploaded"));
      load();
    } catch (err) { push("error", err instanceof Error ? err.message : t("admin_error")); }
    finally { setUploading(false); }
  };
  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("admin_error"));
      push("success", t("admin_deleted")); setDeleteTarget(null); load();
    } catch { push("error", t("admin_error")); }
    finally { setDeleting(false); }
  };
  const copyPath = async (m: Media) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + m.path);
      setCopiedId(m.id);
      push("success", t("admin_copied_msg"));
      setTimeout(() => setCopiedId(null), 2000);
    } catch { push("error", t("admin_error")); }
  };
  const isImage = (mime: string) => mime.startsWith("image/");

  return (
    <div>
      <PageHeader title={t("admin_media_title")} subtitle={t("admin_media_subtitle")} action={<button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary !py-2.5">{uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {t("admin_upload")}</button>} />
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf" className="hidden" onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors mb-6 ${dragOver ? "border-indigo-500 bg-indigo-500/5" : "border-[var(--border)] hover:border-indigo-500/60"}`}
      >
        <Upload size={32} className="mx-auto text-[var(--muted)]" />
        <p className="font-semibold mt-3">{t("admin_upload")}</p>
        <p className="text-xs text-[var(--muted)] mt-1">JPG, PNG, WebP, GIF, SVG, PDF · max 5 MB</p>
      </div>
      {loading ? <div className="flex items-center gap-2 text-[var(--muted)]"><Loader2 className="animate-spin" size={18} /> {t("admin_loading")}</div>
        : items.length === 0 ? <EmptyState text={t("admin_no_results")} />
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((m) => (
              <div key={m.id} className="card overflow-hidden glow-card">
                <div className="h-36 bg-[var(--surface-2)] flex items-center justify-center overflow-hidden">
                  {isImage(m.mime) ? <img src={m.path} alt={m.filename} className="w-full h-full object-cover" /> : <FileText size={40} className="text-[var(--muted)]" />}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm truncate" title={m.filename}>{m.filename}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{formatFileSize(m.size)} · {formatDate(m.created_at)}</p>
                  <p className="text-xs text-[var(--muted)] truncate mt-1">{m.path}</p>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={() => copyPath(m)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold hover:border-indigo-500">{copiedId === m.id ? <Check size={14} /> : <Copy size={14} />} {t("admin_copy_link")}</button>
                    <a href={m.path} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[var(--border)] hover:border-indigo-500" aria-label={t("admin_open")}><ExternalLink size={15} /></a>
                    <button onClick={() => setDeleteTarget(m)} className="p-2 rounded-lg border border-[var(--border)] text-red-400 hover:border-red-500" aria-label={t("admin_delete")}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={doDelete} loading={deleting} />
    </div>
  );
}
