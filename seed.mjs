// Standalone seed script – runs in Railway shell
// Usage: node seed.mjs

import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const dataPath = path.resolve(process.cwd(), "app_db_export.json");
if (!fs.existsSync(dataPath)) {
  console.error(`File not found: ${dataPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Insert order respects foreign keys
const tables = [
  "users",
  "user_settings",
  "subjects",
  "subject_sections",
  "weekly_plans",
  "change_requests",
  "task_reminders",
  "announcements",
];

const db = await mysql.createConnection(url);

for (const table of tables) {
  const rows = data[table];
  if (!rows || rows.length === 0) {
    console.log(`Skipping ${table}: empty`);
    continue;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO \`${table}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders})`;

  for (const row of rows) {
    try {
      await db.execute(sql, columns.map((c) => row[c] ?? null));
    } catch (err) {
      console.error(`Failed to insert into ${table}:`, err?.message ?? err);
    }
  }
  console.log(`✓ ${table}: ${rows.length} rows`);
}

await db.end();
console.log("\nSeed complete!");
process.exit(0);
