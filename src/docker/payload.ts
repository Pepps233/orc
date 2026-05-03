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
    // NOTE: host.docker.internal works on Docker Desktop (macOS/Windows).
    // On Linux, add --add-host=host.docker.internal:host-gateway to the
    // container run args or pass the host gateway IP via an env var.
    orchestratorUrl: `http://host.docker.internal:${orchestratorPort}`,
  };
}
