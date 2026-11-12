"use client";
import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 fade-in" onClick={onClose} />
      <div className="modal-in relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
