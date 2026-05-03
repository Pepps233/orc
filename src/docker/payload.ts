import type { StartupPayload, Subtask } from "../types.js";

export function buildStartupPayload(
  subtask: Subtask,
  orchestratorPort: number,
): StartupPayload {
  return {
    subtaskId: subtask.id,
    taskId: subtask.taskId,
    role: subtask.role,
    description: subtask.description,
    tools: subtask.tools,
    peers: subtask.peers,
    orchestratorUrl: `http://host.docker.internal:${orchestratorPort}`,
  };
}
