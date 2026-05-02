import Database from "better-sqlite3";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

let db: Database.Database | null = null;

function getDbPath(): string {
  const dir = join(homedir(), ".orc");
  mkdirSync(dir, { recursive: true });
  return join(dir, "orc.db");
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initialize() first.");
  }
  return db;
}

export function initialize(): void {
  if (db) return;

  db = new Database(getDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_prompt TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      parent_subtask_id TEXT,
      role TEXT NOT NULL,
      description TEXT NOT NULL,
      tools TEXT NOT NULL DEFAULT '[]',
      peers TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL,
      container_id TEXT,
      result TEXT,
      critic_verdict TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS subtask_logs (
      id TEXT PRIMARY KEY,
      subtask_id TEXT NOT NULL,
      stream TEXT NOT NULL,
      line TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (subtask_id) REFERENCES subtasks(id)
    );
  `);
}

export function close(): void {
  if (db) {
    db.close();
    db = null;
  }
}
