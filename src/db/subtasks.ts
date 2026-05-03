import { v4 as uuid } from "uuid";
import { getDb } from "./index.js";
import type { Subtask, SubtaskStatus, CriticVerdict } from "../types.js";

export function createSubtask(
  subtask: Omit<
    Subtask,
    "createdAt" | "completedAt" | "result" | "criticVerdict" | "containerId"
  >,
): Subtask {
  const db = getDb();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO subtasks
     (id, task_id, parent_subtask_id, role, description, tools, peers, status, attempt_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    subtask.id,
    subtask.taskId,
    subtask.parentSubtaskId,
    subtask.role,
    subtask.description,
    JSON.stringify(subtask.tools),
    JSON.stringify(subtask.peers),
    subtask.status,
    subtask.attemptCount,
    createdAt,
  );
  return { ...subtask, createdAt, completedAt: null, result: null, criticVerdict: null, containerId: null };
}

export function getSubtask(id: string): Subtask | undefined {
  const db = getDb();
  return rowToSubtask(
    db.prepare("SELECT * FROM subtasks WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined,
  );
}

export function getSubtasksByTask(taskId: string): Subtask[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at")
    .all(taskId) as Record<string, unknown>[];
  return rows.map(rowToSubtask).filter((s): s is Subtask => s !== undefined);
}

export function updateSubtaskStatus(
  id: string,
  status: SubtaskStatus,
): void {
  const db = getDb();
  const completedAt =
    status === "passed" || status === "failed"
      ? new Date().toISOString()
      : null;
  if (completedAt) {
    db.prepare(
      "UPDATE subtasks SET status = ?, completed_at = ? WHERE id = ?",
    ).run(status, completedAt, id);
  } else {
    db.prepare("UPDATE subtasks SET status = ? WHERE id = ?").run(status, id);
  }
}

export function updateSubtaskResult(
  id: string,
  result: string,
  containerId: string,
): void {
  const db = getDb();
  db.prepare(
    "UPDATE subtasks SET result = ?, container_id = ? WHERE id = ?",
  ).run(result, containerId, id);
}

export function updateSubtaskVerdict(
  id: string,
  verdict: CriticVerdict,
): void {
  const db = getDb();
  db.prepare(
    "UPDATE subtasks SET critic_verdict = ? WHERE id = ?",
  ).run(JSON.stringify(verdict), id);
}

export function getBlockedSubtasks(taskId: string): Subtask[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM subtasks WHERE task_id = ? AND status = 'blocked'",
    )
    .all(taskId) as Record<string, unknown>[];
  return rows.map(rowToSubtask).filter((s): s is Subtask => s !== undefined);
}

export function getReadySubtasks(taskId: string): Subtask[] {
  const db = getDb();
  const all = db
    .prepare("SELECT * FROM subtasks WHERE task_id = ?")
    .all(taskId) as Record<string, unknown>[];
  const subtasks = all
    .map(rowToSubtask)
    .filter((s): s is Subtask => s !== undefined);

  return subtasks.filter((subtask) => {
    if (subtask.status !== "pending") return false;
    if (!subtask.parentSubtaskId) return true;
    const parent = subtasks.find((s) => s.id === subtask.parentSubtaskId);
    return parent?.status === "passed";
  });
}

function rowToSubtask(
  row: Record<string, unknown> | undefined,
): Subtask | undefined {
  if (!row) return undefined;
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    parentSubtaskId: row.parent_subtask_id as string | null,
    role: row.role as string,
    description: row.description as string,
    tools: JSON.parse(row.tools as string),
    peers: JSON.parse(row.peers as string),
    status: row.status as SubtaskStatus,
    containerId: row.container_id as string | null,
    result: row.result as string | null,
    criticVerdict: row.critic_verdict
      ? (JSON.parse(row.critic_verdict as string) as CriticVerdict)
      : null,
    attemptCount: row.attempt_count as number,
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string | null,
  };
}
