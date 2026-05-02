import { v4 as uuidv4 } from "uuid";
import { getDb } from "./index.js";
import type { LogEntry, LogStream } from "../types.js";

interface LogInput {
  subtaskId: string;
  stream: LogStream;
  line: string;
}

interface LogRow {
  id: string;
  subtask_id: string;
  stream: string;
  line: string;
  timestamp: string;
}

export function insertLog(entry: LogInput): void {
  const db = getDb();
  const id = uuidv4();
  const timestamp = new Date().toISOString();

  db.prepare(
    "INSERT INTO subtask_logs (id, subtask_id, stream, line, timestamp) VALUES (?, ?, ?, ?, ?)"
  ).run(id, entry.subtaskId, entry.stream, entry.line, timestamp);
}

let insertBatchStmt: ReturnType<ReturnType<typeof getDb>["prepare"]> | null =
  null;

export function insertLogBatch(entries: LogInput[]): void {
  if (entries.length === 0) return;

  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO subtask_logs (id, subtask_id, stream, line, timestamp) VALUES (?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((items: LogInput[]) => {
    for (const entry of items) {
      const id = uuidv4();
      const timestamp = new Date().toISOString();
      stmt.run(id, entry.subtaskId, entry.stream, entry.line, timestamp);
    }
  });

  insertMany(entries);
}

export function getLogsBySubtask(subtaskId: string): LogEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM subtask_logs WHERE subtask_id = ? ORDER BY timestamp ASC"
    )
    .all(subtaskId) as LogRow[];
  return rows.map(rowToLogEntry);
}

export function getLogsByTask(taskId: string): LogEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT sl.* FROM subtask_logs sl
       JOIN subtasks s ON sl.subtask_id = s.id
       WHERE s.task_id = ?
       ORDER BY sl.timestamp ASC`
    )
    .all(taskId) as LogRow[];
  return rows.map(rowToLogEntry);
}

function rowToLogEntry(row: LogRow): LogEntry {
  return {
    id: row.id,
    subtaskId: row.subtask_id,
    stream: row.stream as LogStream,
    line: row.line,
    timestamp: row.timestamp,
  };
}
