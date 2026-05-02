import { v4 as uuidv4 } from "uuid";
import { getDb } from "./index.js";
import type {
  Subtask,
  SubtaskStatus,
  CriticVerdict,
  AgentRole,
  ToolName,
} from "../types.js";

interface SubtaskInput {
  taskId: string;
  parentSubtaskId: string | null;
  role: AgentRole;
  description: string;
  tools: ToolName[];
  peers: Record<string, string>;
  status: SubtaskStatus;
  attemptCount: number;
}

interface SubtaskRow extends Record<string, unknown> {
  id: string;
  task_id: string;
  parent_subtask_id: string | null;
  role: string;
  description: string;
  tools: string;
  peers: string;
  status: string;
  container_id: string | null;
  result: string | null;
  critic_verdict: string | null;
  attempt_count: number;
  created_at: string;
  completed_at: string | null;
}

export function createSubtask(input: SubtaskInput): Subtask {
  const db = getDb();
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO subtasks (id, task_id, parent_subtask_id, role, description, tools, peers, status, attempt_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.taskId,
    input.parentSubtaskId,
    input.role,
    input.description,
    JSON.stringify(input.tools),
    JSON.stringify(input.peers),
    input.status,
    input.attemptCount,
    createdAt
  );

  return {
    id,
    taskId: input.taskId,
    parentSubtaskId: input.parentSubtaskId,
    role: input.role,
    description: input.description,
    tools: input.tools,
    peers: input.peers,
    status: input.status,
    containerId: null,
    result: null,
    criticVerdict: null,
    attemptCount: input.attemptCount,
    createdAt,
    completedAt: null,
  };
}

export function getSubtask(id: string): Subtask | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM subtasks WHERE id = ?")
    .get(id) as SubtaskRow | undefined;
  if (!row) return undefined;
  return rowToSubtask(row);
}

export function getSubtasksByTask(taskId: string): Subtask[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC")
    .all(taskId) as SubtaskRow[];
  return rows.map(rowToSubtask);
}

export function updateSubtaskStatus(
  id: string,
  status: SubtaskStatus
): void {
  const db = getDb();
  const completedAt =
    status === "passed" || status === "failed"
      ? new Date().toISOString()
      : null;

  if (completedAt) {
    db.prepare(
      "UPDATE subtasks SET status = ?, completed_at = ? WHERE id = ?"
    ).run(status, completedAt, id);
  } else {
    db.prepare("UPDATE subtasks SET status = ? WHERE id = ?").run(status, id);
  }
}

export function updateSubtaskResult(
  id: string,
  result: string,
  containerId: string
): void {
  const db = getDb();
  db.prepare(
    "UPDATE subtasks SET result = ?, container_id = ? WHERE id = ?"
  ).run(result, containerId, id);
}

export function updateSubtaskVerdict(
  id: string,
  verdict: CriticVerdict
): void {
  const db = getDb();
  db.prepare(
    "UPDATE subtasks SET critic_verdict = ? WHERE id = ?"
  ).run(JSON.stringify(verdict), id);
}

export function getBlockedSubtasks(taskId: string): Subtask[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM subtasks WHERE task_id = ? AND status = ? ORDER BY created_at ASC"
    )
    .all(taskId, "blocked") as SubtaskRow[];
  return rows.map(rowToSubtask);
}

export function getReadySubtasks(taskId: string): Subtask[] {
  const db = getDb();
  const allSubtasks = getSubtasksByTask(taskId);
  const pending = allSubtasks.filter((s) => s.status === "pending");

  return pending.filter((subtask) => {
    if (!subtask.parentSubtaskId) return true;
    const parent = allSubtasks.find((s) => s.id === subtask.parentSubtaskId);
    return parent ? parent.status === "passed" : true;
  });
}

function rowToSubtask(row: SubtaskRow): Subtask {
  return {
    id: row.id,
    taskId: row.task_id,
    parentSubtaskId: row.parent_subtask_id,
    role: row.role as AgentRole,
    description: row.description,
    tools: JSON.parse(row.tools) as ToolName[],
    peers: JSON.parse(row.peers) as Record<string, string>,
    status: row.status as SubtaskStatus,
    containerId: row.container_id,
    result: row.result,
    criticVerdict: row.critic_verdict
      ? (JSON.parse(row.critic_verdict) as CriticVerdict)
      : null,
    attemptCount: row.attempt_count,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}
