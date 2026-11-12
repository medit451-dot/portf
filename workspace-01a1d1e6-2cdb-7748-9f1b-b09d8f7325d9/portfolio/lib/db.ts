import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const globalForDb = globalThis as unknown as { _db?: Database.Database };

function createDb(): Database.Database {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "portfolio.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      firebase_uid TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'admin',
      auth_provider TEXT NOT NULL DEFAULT 'password',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'medit',
      title TEXT NOT NULL DEFAULT 'Full-Stack Developer',
      subtitle TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      about_text TEXT NOT NULL DEFAULT '',
      specialization TEXT NOT NULL DEFAULT '',
      interests TEXT NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT 'medit451@gmail.com',
      location TEXT NOT NULL DEFAULT '',
      github TEXT NOT NULL DEFAULT 'https://github.com',
      linkedin TEXT NOT NULL DEFAULT 'https://linkedin.com',
      discord TEXT NOT NULL DEFAULT '',
      telegram TEXT NOT NULL DEFAULT '',
      resume_url TEXT NOT NULL DEFAULT '',
      stats TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Tools & Technologies',
      level INTEGER NOT NULL DEFAULT 80 CHECK (level >= 0 AND level <= 100),
      icon TEXT NOT NULL DEFAULT 'code',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      short_desc TEXT NOT NULL DEFAULT '',
      full_desc TEXT NOT NULL DEFAULT '',
      cover TEXT NOT NULL DEFAULT '',
      gallery TEXT NOT NULL DEFAULT '[]',
      tech TEXT NOT NULL DEFAULT '[]',
      category TEXT NOT NULL DEFAULT 'Web',
      github_url TEXT NOT NULL DEFAULT '',
      live_url TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','in_progress','archived')),
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'work' CHECK (type IN ('work','internship','education','certificate','achievement')),
      title TEXT NOT NULL,
      org TEXT NOT NULL DEFAULT '',
      period TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      ip TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      mime TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  ensureUserColumns(db);
  seedIfEmpty(db);
}

function ensureUserColumns(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("firebase_uid")) db.exec("ALTER TABLE users ADD COLUMN firebase_uid TEXT");
  if (!names.has("role")) db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'");
  if (!names.has("auth_provider")) db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password'");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL");
}

function seedIfEmpty(db: Database.Database) {
  // Admin user. Keep the configured account available even when an older
  // database already contains the legacy demo user. Existing passwords are
  // not overwritten, so changing the password in the security screen remains
  // effective after a restart.
  const adminEmail = (process.env.ADMIN_EMAIL || "medit451@gmail.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "03887388";
  const configuredAdmin = db.prepare("SELECT id FROM users WHERE lower(email) = ?").get(adminEmail) as { id: number } | undefined;
  if (!configuredAdmin) {
    const hash = bcrypt.hashSync(adminPassword, 12);
    db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(adminEmail, hash);
    console.log(`[seed] Admin account ready: ${adminEmail}`);
  }

  // Profile
  const profileCount = (db.prepare("SELECT COUNT(*) as c FROM profile").get() as { c: number }).c;
  if (profileCount === 0) {
    const stats = JSON.stringify({ projects: 24, years: 4, clients: 12, awards: 3 });
    db.prepare(
      `INSERT INTO profile (id, name, title, subtitle, bio, about_text, specialization, interests, email, location, github, linkedin, discord, telegram, stats)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      "medit",
      "Full-Stack Developer",
      "Создаю быстрые, надёжные и красивые веб-приложения",
      "Full-Stack разработчик с 4+ годами опыта. Специализируюсь на современных веб-технологиях: React, Next.js, Node.js и PostgreSQL. Люблю чистый код, продуманный UX и производительность.",
      "Я — Full-Stack разработчик, который превращает идеи в работающие продукты. Работаю над веб-приложениями полного цикла: от дизайна интерфейса и API до баз данных и деплоя. Увлекаюсь производительностью, доступностью и красивой анимацией.",
      "Frontend / Backend / Full-Stack",
      "Веб-разработка, API, базы данных, DevOps, UI/UX",
      "medit451@gmail.com",
      "West Chicago, IL, USA",
      "https://github.com",
      "https://linkedin.com",
      "https://discord.com",
      "https://t.me",
      stats
    );
  }

  // Skills
  const skillCount = (db.prepare("SELECT COUNT(*) as c FROM skills").get() as { c: number }).c;
  if (skillCount === 0) {
    const skills: [string, string, number, string][] = [
      ["React", "Frontend Development", 92, "atom"],
      ["TypeScript", "Programming Languages", 90, "code"],
      ["Next.js", "Frontend Development", 88, "zap"],
      ["Tailwind CSS", "Frontend Development", 90, "palette"],
      ["Vue.js", "Frontend Development", 75, "layers"],
      ["Node.js", "Backend Development", 85, "server"],
      ["Express", "Backend Development", 82, "server"],
      ["Python", "Programming Languages", 78, "code"],
      ["PostgreSQL", "Databases", 84, "database"],
      ["MongoDB", "Databases", 76, "database"],
      ["Redis", "Databases", 70, "database"],
      ["Unity", "Game Development", 68, "gamepad"],
      ["C#", "Programming Languages", 72, "code"],
      ["Git", "Tools & Technologies", 90, "git-branch"],
      ["Docker", "Tools & Technologies", 80, "box"],
      ["Linux", "Tools & Technologies", 78, "terminal"],
      ["Figma", "Tools & Technologies", 82, "pen-tool"],
      ["GraphQL", "Backend Development", 74, "share-2"],
    ];
    const stmt = db.prepare("INSERT INTO skills (name, category, level, icon, sort_order) VALUES (?, ?, ?, ?, ?)");
    skills.forEach(([name, category, level, icon], i) => stmt.run(name, category, level, icon, i));
  }

  // Projects
  const projectCount = (db.prepare("SELECT COUNT(*) as c FROM projects").get() as { c: number }).c;
  if (projectCount === 0) {
    const projects = [
      {
        slug: "ecommerce-platform",
        title: "E-Commerce Platform",
        short_desc: "Полноценный интернет-магазин с корзиной, оплатой и админ-панелью.",
        full_desc: "Современная платформа электронной коммерции: каталог товаров, корзина, оформление заказа, интеграция платёжного шлюза Stripe, панель управления товарами и заказами. Оптимизирована для SEO и скорости загрузки.",
        tech: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Tailwind CSS"],
        category: "Web",
        status: "completed",
        date: "2025-09-01",
      },
      {
        slug: "task-manager",
        title: "TaskFlow — Менеджер задач",
        short_desc: "Командный таск-менеджер с досками Kanban и realtime-синхронизацией.",
        full_desc: "Приложение для управления задачами в команде: Kanban-доски, drag-and-drop, комментарии, уведомления в реальном времени через WebSocket, роли и права доступа.",
        tech: ["React", "Node.js", "Socket.io", "MongoDB"],
        category: "Web",
        status: "completed",
        date: "2025-06-15",
      },
      {
        slug: "ai-chatbot",
        title: "AI Chat Assistant",
        short_desc: "Чат-ассистент на базе LLM с потоковыми ответами и историей диалогов.",
        full_desc: "Веб-интерфейс для работы с большой языковой моделью: стриминг ответов, сохранение истории, экспорт диалогов, поддержка нескольких моделей и тем оформления.",
        tech: ["Next.js", "OpenAI API", "Redis", "Docker"],
        category: "AI",
        status: "in_progress",
        date: "2025-10-20",
      },
      {
        slug: "2d-platformer",
        title: "Pixel Quest — 2D Platformer",
        short_desc: "Пиксельная 2D-игра с уровнями, боссами и системой прокачки.",
        full_desc: "2D платформер на Unity: 12 уровней, система прокачки персонажа, боссы, сохранения в облаке и таблица лидеров. Опубликована в Steam.",
        tech: ["Unity", "C#", "Pixel Art"],
        category: "Game",
        status: "completed",
        date: "2024-11-10",
      },
      {
        slug: "portfolio-cms",
        title: "Portfolio CMS",
        short_desc: "Headless CMS для управления контентом портфолио.",
        full_desc: "Система управления контентом с REST API, ролями пользователей, загрузкой медиа и предпросмотром изменений. Используется для этого сайта.",
        tech: ["Next.js", "PostgreSQL", "Prisma"],
        category: "Web",
        status: "archived",
        date: "2024-03-05",
      },
    ];
    const stmt = db.prepare(
      `INSERT INTO projects (slug, title, short_desc, full_desc, tech, category, status, date, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    );
    for (const p of projects) {
      stmt.run(p.slug, p.title, p.short_desc, p.full_desc, JSON.stringify(p.tech), p.category, p.status, p.date);
    }
  }

  // Experience
  const expCount = (db.prepare("SELECT COUNT(*) as c FROM experience").get() as { c: number }).c;
  if (expCount === 0) {
    const items: [string, string, string, string, string][] = [
      ["work", "Full-Stack Developer", "TechCorp Inc.", "2023 — Present", "Разработка веб-приложений на Next.js и Node.js. Оптимизация производительности, рефакторинг legacy-кода, наставничество junior-разработчиков."],
      ["work", "Frontend Developer", "WebStudio Pro", "2021 — 2023", "Создание интерфейсов на React и TypeScript. Работа с дизайн-системой, повышение конверсии лендингов на 30%."],
      ["internship", "Junior Developer Intern", "StartupLab", "2020 — 2021", "Стажировка: разработка MVP, работа с API, участие в code review и agile-процессах."],
      ["education", "B.Sc. Computer Science", "State University", "2016 — 2020", "Специализация: программная инженерия. Дипломная работа — распределённая система обработки данных."],
      ["certificate", "AWS Certified Developer", "Amazon Web Services", "2024", "Сертификация по разработке и развёртыванию облачных приложений на AWS."],
      ["achievement", "Top 5% на Hackathon Global", "Hackathon Global", "2023", "Команда из 4 человек заняла 5-е место из 500+ команд. Проект — платформа для волонтёров."],
    ];
    const stmt = db.prepare("INSERT INTO experience (type, title, org, period, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
    items.forEach(([type, title, org, period, description], i) => stmt.run(type, title, org, period, description, i));
  }

  // Settings defaults
  const defaults: Record<string, string> = {
    site_name: "medit",
    site_description: "Портфолио Full-Stack разработчика: проекты, навыки, опыт и контакты.",
    logo_text: "medit",
    favicon: "",
    show_about: "1",
    show_skills: "1",
    show_projects: "1",
    show_experience: "1",
    show_contact: "1",
    hero_button_projects: "Посмотреть проекты",
    hero_button_contact: "Связаться со мной",
    seo_title: "medit — Full-Stack Developer Portfolio",
    seo_description: "Портфолио medit: проекты, навыки, опыт и контакты. Full-Stack разработка на React, Next.js, Node.js.",
    og_image: "",
  };
  const stmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(defaults)) stmt.run(k, v);
}

export function getDb(): Database.Database {
  if (!globalForDb._db) globalForDb._db = createDb();
  return globalForDb._db;
}

export function upsertFirebaseAdmin(identity: { uid: string; email: string; provider: string }) {
  const db = getDb();
  const email = identity.email.trim().toLowerCase();
  const provider = identity.provider.trim() || "firebase";
  if (!identity.uid || !email) throw new Error("A verified Firebase email is required");

  const save = db.transaction(() => {
    const byUid = db.prepare("SELECT id, email FROM users WHERE firebase_uid = ?").get(identity.uid) as
      | { id: number; email: string }
      | undefined;
    if (byUid) {
      db.prepare("UPDATE users SET role = 'admin', auth_provider = ? WHERE id = ?").run(provider, byUid.id);
      return { id: byUid.id, email: byUid.email, role: "admin" as const };
    }

    const byEmail = db.prepare("SELECT id, email FROM users WHERE lower(email) = lower(?)").get(email) as
      | { id: number; email: string }
      | undefined;
    if (byEmail) {
      db.prepare("UPDATE users SET firebase_uid = ?, role = 'admin', auth_provider = ? WHERE id = ?").run(identity.uid, provider, byEmail.id);
      return { id: byEmail.id, email: byEmail.email, role: "admin" as const };
    }

    // Firebase owns the password. The local hash is an unusable random value;
    // it exists only because the legacy SQLite schema requires a non-null hash.
    const unusableHash = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);
    const result = db.prepare(
      "INSERT INTO users (email, password_hash, firebase_uid, role, auth_provider) VALUES (?, ?, ?, 'admin', ?)",
    ).run(email, unusableHash, identity.uid, provider);
    return { id: Number(result.lastInsertRowid), email, role: "admin" as const };
  });

  return save();
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  about_text: string;
  specialization: string;
  interests: string;
  avatar_url: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  discord: string;
  telegram: string;
  resume_url: string;
  stats: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  short_desc: string;
  full_desc: string;
  cover: string;
  gallery: string;
  tech: string;
  category: string;
  github_url: string;
  live_url: string;
  date: string;
  status: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  id: number;
  type: string;
  title: string;
  org: string;
  period: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: number;
  ip: string;
  created_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  path: string;
  size: number;
  mime: string;
  created_at: string;
}

export function getProfile(): Profile {
  const db = getDb();
  let row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as Profile | undefined;
  if (!row) {
    db.prepare("INSERT INTO profile (id) VALUES (1)").run();
    row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as Profile;
  }
  return row;
}

export function getSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "project";
}

export function resetDemoData(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM messages;
    DELETE FROM media;
    DELETE FROM projects;
    DELETE FROM skills;
    DELETE FROM experience;
    DELETE FROM profile;
    DELETE FROM settings;
  `);
  seedIfEmpty(db);
}

export function exportAllData(): Record<string, unknown> {
  const db = getDb();
  return {
    profile: db.prepare("SELECT * FROM profile").all(),
    settings: db.prepare("SELECT * FROM settings").all(),
    skills: db.prepare("SELECT * FROM skills ORDER BY sort_order ASC").all(),
    projects: db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all(),
    experience: db.prepare("SELECT * FROM experience ORDER BY sort_order ASC").all(),
    messages: db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all(),
    media: db.prepare("SELECT * FROM media ORDER BY created_at DESC").all(),
    exported_at: new Date().toISOString(),
  };
}
