import { v4 as uuidv4 } from "uuid";
import { getDb } from "./index.js";
import type { Task, TaskStatus } from "../types.js";

interface TaskRow {
  id: string;
  user_prompt: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export function createTask(userPrompt: string): Task {
  const db = getDb();
  const id = uuidv4();
  const status: TaskStatus = "pending";
  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO tasks (id, user_prompt, status, created_at) VALUES (?, ?, ?, ?)"
  ).run(id, userPrompt, status, createdAt);

  return { id, userPrompt, status, createdAt, completedAt: null };
}

export function getTask(id: string): Task | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id) as TaskRow | undefined;
  if (!row) return undefined;
  return rowToTask(row);
}

export function updateTaskStatus(id: string, status: TaskStatus): void {
  const db = getDb();
  const isTerminal = status === "completed" || status === "failed";
  const completedAt = isTerminal ? new Date().toISOString() : null;

  db.prepare(
    "UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?"
  ).run(status, completedAt, id);
}

export function listTasks(limit = 20, offset = 0): Task[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as TaskRow[];
  return rows.map(rowToTask);
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    userPrompt: row.user_prompt,
    status: row.status as TaskStatus,
    createdAt: row.created_at,
    completedAt: row.completed_at || null,
  };
}
