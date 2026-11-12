// Seed script: creates the database and demo data by importing the app DB layer via a tiny bootstrap.
// Usage: npm run seed  (requires built dependencies; the DB is also auto-seeded on first server start)
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "portfolio.db");
if (fs.existsSync(dbPath)) {
  console.log("Database already exists at", dbPath);
  console.log("Delete data/portfolio.db to re-seed from scratch.");
  process.exit(0);
}
console.log("No database found. Starting the server briefly will auto-seed it...");
console.log("Run: npm run dev  (or npm run build && npm start) — demo data is created on first start.");
console.log("Default admin: medit451@gmail.com / 03887388 (override via .env ADMIN_EMAIL / ADMIN_PASSWORD)");
