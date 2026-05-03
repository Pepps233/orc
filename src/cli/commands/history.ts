import { initialize, close } from "../../db/index.js";
import { listTasks } from "../../db/tasks.js";

export async function runHistory(): Promise<void> {
  try {
    initialize();
    const tasks = listTasks();

    if (tasks.length === 0) {
      console.log("No tasks found. Run 'orc run \"your task\"' to get started.");
      return;
    }

    const truncated = (s: string, max: number): string =>
      s.length > max ? s.slice(0, max - 3) + "..." : s;
    const padRight = (s: string, len: number): string =>
      s.length > len ? s.slice(0, len) : s.padEnd(len);

    const colId = 12;
    const colStatus = 12;
    const colDate = 22;
    const colPrompt = 60;

    console.log(
      `${padRight("ID", colId)} ${padRight("Status", colStatus)} ${padRight("Date", colDate)} Prompt`,
    );
    console.log(
      `${"-".repeat(colId)} ${"-".repeat(colStatus)} ${"-".repeat(colDate)} ${"-".repeat(colPrompt)}`,
    );

    for (const task of tasks) {
      const id = truncated(task.id, 8);
      const prompt = truncated(task.userPrompt, 60);
      const date = task.createdAt.slice(0, 19).replace("T", " ");
      console.log(
        `${padRight(id, colId)} ${padRight(task.status, colStatus)} ${padRight(date, colDate)} ${prompt}`,
      );
    }
  } finally {
    close();
  }
}
