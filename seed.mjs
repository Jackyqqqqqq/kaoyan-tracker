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

function fixDatetime(val) {
  // Convert ISO 8601 like "2026-05-14T02:18:11.000Z" to MySQL datetime "2026-05-14 02:18:11"
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
    return val.replace("T", " ").replace(/\.\d{3}Z$/, "");
  }
  return val;
}

const db = await mysql.createConnection(url);

// Truncate in reverse order to respect foreign keys
const reverseOrder = [...tables].reverse();
for (const table of reverseOrder) {
  if (data[table] && data[table].length > 0) {
    try {
      await db.execute(`TRUNCATE TABLE \`${table}\``);
      console.log(`Cleared ${table}`);
    } catch (err) {
      console.error(`Failed to clear ${table}:`, err?.message ?? err);
    }
  }
}

for (const table of tables) {
  const rows = data[table];
  if (!rows || rows.length === 0) {
    console.log(`Skipping ${table}: empty`);
    continue;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO \`${table}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders})`;

  let ok = 0;
  for (const row of rows) {
    try {
      await db.execute(sql, columns.map((c) => fixDatetime(row[c] ?? null)));
      ok++;
    } catch (err) {
      console.error(`Failed to insert into ${table}:`, err?.message ?? err);
    }
  }
  console.log(`✓ ${table}: ${ok}/${rows.length} rows`);
}

await db.end();
console.log("\nSeed complete!");
process.exit(0);
