import type { Subtask, LogEntry } from "../types.js";

export interface PipelineCallbacks {
  onSubtaskStatusChange: (subtask: Subtask) => void;
  onLog: (entry: LogEntry) => void;
  onEvent: (message: string) => void;
}

export async function runPipeline(
  userPrompt: string,
  callbacks: PipelineCallbacks,
): Promise<string> {
  callbacks.onEvent("Orchestrator not wired yet");
  callbacks.onEvent(`Would run: ${userPrompt}`);
  return "stub";
}
