import { v4 as uuid } from "uuid";
import { getDb } from "./index.js";
import type { LogEntry, LogStream } from "../types.js";

export function insertLog(
  entry: Omit<LogEntry, "id" | "timestamp">,
): void {
  insertLogBatch([entry]);
}

export function insertLogBatch(
  entries: Omit<LogEntry, "id" | "timestamp">[],
): void {
  const db = getDb();
  const timestamp = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO subtask_logs (id, subtask_id, stream, line, timestamp) VALUES (?, ?, ?, ?, ?)",
  );
  const insert = db.transaction(() => {
    for (const entry of entries) {
      stmt.run(uuid(), entry.subtaskId, entry.stream, entry.line, timestamp);
    }
  });
  insert();
}

export function getLogsBySubtask(subtaskId: string): LogEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM subtask_logs WHERE subtask_id = ? ORDER BY timestamp",
    )
    .all(subtaskId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    subtaskId: row.subtask_id as string,
    stream: row.stream as LogStream,
    line: row.line as string,
    timestamp: row.timestamp as string,
  }));
}

export function getLogsByTask(taskId: string): LogEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT sl.* FROM subtask_logs sl
       JOIN subtasks s ON sl.subtask_id = s.id
       WHERE s.task_id = ?
       ORDER BY sl.timestamp`,
    )
    .all(taskId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    subtaskId: row.subtask_id as string,
    stream: row.stream as LogStream,
    line: row.line as string,
    timestamp: row.timestamp as string,
  }));
}
