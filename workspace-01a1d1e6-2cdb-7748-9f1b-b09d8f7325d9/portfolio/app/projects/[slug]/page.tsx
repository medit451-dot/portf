import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Github, ExternalLink, Calendar, FolderGit2 } from "lucide-react";
import { getDb, type Project } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import ProjectDetailClient from "./ProjectDetailClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const db = getDb();
  const p = db.prepare("SELECT * FROM projects WHERE slug = ? AND published = 1").get(params.slug) as Project | undefined;
  if (!p) return { title: "Project not found" };
  return { title: `${p.title} — Portfolio`, description: p.short_desc, openGraph: { title: p.title, description: p.short_desc, images: p.cover ? [{ url: p.cover }] : [] } };
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const db = getDb();
  const p = db.prepare("SELECT * FROM projects WHERE slug = ? AND published = 1").get(params.slug) as Project | undefined;
  if (!p) notFound();
  const tech = parseJsonArray(p.tech);
  const gallery = parseJsonArray(p.gallery);
  const others = db.prepare("SELECT * FROM projects WHERE published = 1 AND id != ? ORDER BY created_at DESC LIMIT 3").all(p.id) as Project[];
  return (
    <ProjectDetailClient project={p} tech={tech} gallery={gallery} others={others} />
  );
}
