"use client";
import Link from "next/link";
import { Home } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="pt-16 min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-gradient">404</p>
        <h1 className="text-2xl font-bold mt-4">{t("not_found_title")}</h1>
        <p className="text-[var(--muted)] mt-2">{t("not_found_text")}</p>
        <Link href="/" className="btn-primary mt-8"><Home size={17} /> {t("not_found_home")}</Link>
      </div>
    </div>
  );
}
