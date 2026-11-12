"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; type: ToastType; message: string; }
const ToastCtx = createContext<{ push: (type: ToastType, message: string) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);
  const remove = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div key={t.id} className="toast-in flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-2xl">
            {t.type === "success" && <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === "error" && <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info size={20} className="text-sky-400 shrink-0 mt-0.5" />}
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} aria-label="Close" className="opacity-60 hover:opacity-100"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
