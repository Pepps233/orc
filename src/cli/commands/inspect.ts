import { initialize, close } from "../../db/index.js";
import { getTask } from "../../db/tasks.js";
import { getSubtasksByTask } from "../../db/subtasks.js";
import { getLogsByTask } from "../../db/logs.js";

export async function runInspect(taskId: string): Promise<void> {
  try {
    initialize();

    const task = getTask(taskId);
    if (!task) {
      console.log(`Task not found: ${taskId}`);
      return;
    }

    console.log("Task Details");
    console.log("=".repeat(60));
    console.log(`ID:        ${task.id}`);
    console.log(`Prompt:    ${task.userPrompt}`);
    console.log(`Status:    ${task.status}`);
    console.log(`Created:   ${task.createdAt}`);
    if (task.completedAt) {
      console.log(`Completed: ${task.completedAt}`);
    }
    console.log();

    const subtasks = getSubtasksByTask(taskId);
    if (subtasks.length > 0) {
      console.log("Subtasks");
      console.log("=".repeat(60));
      for (const sub of subtasks) {
        const statusIcon = statusEmoji(sub.status);
        const verdict = sub.criticVerdict
          ? ` (score: ${sub.criticVerdict.score.toFixed(1)}, ${sub.criticVerdict.passed ? "passed" : "failed"})`
          : "";
        console.log(
          `  ${statusIcon} ${sub.role} [${sub.status}]${verdict}`,
        );
        console.log(`    ${sub.description}`);
        if (sub.result) {
          const resultPreview =
            sub.result.length > 200
              ? sub.result.slice(0, 200) + "..."
              : sub.result;
          console.log(`    Result: ${resultPreview.split("\n").join("\n    ")}`);
        }
      }
      console.log();
    }

    const logs = getLogsByTask(taskId);
    if (logs.length > 0) {
      console.log("Logs");
      console.log("=".repeat(60));
      for (const log of logs.slice(-50)) {
        const ts = log.timestamp.slice(11, 19);
        const prefix = `  ${ts} [${log.stream}]`.padEnd(24);
        console.log(`${prefix} ${log.line}`);
      }
      if (logs.length > 50) {
        console.log(`  ... and ${logs.length - 50} more log lines`);
      }
    }
  } finally {
    close();
  }
}

function statusEmoji(status: string): string {
  switch (status) {
    case "passed":
      return "✓";
    case "failed":
      return "✗";
    case "running":
      return "⟳";
    case "blocked":
      return "⏸";
    case "retrying":
      return "↻";
    case "awaiting_review":
      return "⃝";
    case "pending":
      return "○";
    default:
      return "?";
  }
}
