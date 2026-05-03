import Database from "better-sqlite3";
import { homedir } from "os";
import { join } from "path";
import { mkdirSync } from "fs";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initialize() first.");
  }
  return db;
}

export function initialize(): void {
  const orcDir = join(homedir(), ".orc");
  mkdirSync(orcDir, { recursive: true });

  db = new Database(join(orcDir, "orc.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
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
      status TEXT NOT NULL DEFAULT 'pending',
      container_id TEXT,
      result TEXT,
      critic_verdict TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS subtask_logs (
      id TEXT PRIMARY KEY,
      subtask_id TEXT NOT NULL,
      stream TEXT NOT NULL,
      line TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
    CREATE INDEX IF NOT EXISTS idx_subtask_logs_subtask_id ON subtask_logs(subtask_id);
  `);
}

export function close(): void {
  if (db) {
    db.close();
    db = null;
  }
}
