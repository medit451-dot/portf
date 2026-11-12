import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/about", "/contact", "/projects"].map((r) => ({ url: `${base}${r}`, lastModified: new Date() }));
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = getDb();
    const rows = db.prepare("SELECT slug FROM projects WHERE published = 1").all() as { slug: string }[];
    projectRoutes = rows.map((r) => ({ url: `${base}/projects/${r.slug}`, lastModified: new Date() }));
  } catch {}
  return [...staticRoutes, ...projectRoutes];
}
