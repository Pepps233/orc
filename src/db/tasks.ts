import { v4 as uuid } from "uuid";
import { getDb } from "./index.js";
import type { Task, TaskStatus } from "../types.js";

export function createTask(userPrompt: string): Task {
  const db = getDb();
  const id = uuid();
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO tasks (id, user_prompt, status, created_at) VALUES (?, ?, 'pending', ?)",
  ).run(id, userPrompt, createdAt);
  return { id, userPrompt, status: "pending", createdAt, completedAt: null };
}

export function getTask(id: string): Task | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  if (!row) return undefined;
  return {
    id: row.id as string,
    userPrompt: row.user_prompt as string,
    status: row.status as TaskStatus,
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string | null,
  };
}

export function updateTaskStatus(id: string, status: TaskStatus): void {
  const db = getDb();
  const completedAt =
    status === "completed" || status === "failed"
      ? new Date().toISOString()
      : null;
  if (completedAt) {
    db.prepare(
      "UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?",
    ).run(status, completedAt, id);
  } else {
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, id);
  }
}

export function listTasks(limit = 20, offset = 0): Task[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .all(limit, offset) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    userPrompt: row.user_prompt as string,
    status: row.status as TaskStatus,
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string | null,
  }));
}
