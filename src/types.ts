export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface Task {
  id: string;
  userPrompt: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
}

export type SubtaskStatus =
  | "blocked"
  | "pending"
  | "running"
  | "awaiting_review"
  | "passed"
  | "failed"
  | "retrying";

export type AgentRole = string;

export type ToolName = string;

export interface Subtask {
  id: string;
  taskId: string;
  parentSubtaskId: string | null;
  role: AgentRole;
  description: string;
  tools: ToolName[];
  peers: Record<string, string>;
  status: SubtaskStatus;
  containerId: string | null;
  result: string | null;
  criticVerdict: CriticVerdict | null;
  attemptCount: number;
  createdAt: string;
  completedAt: string | null;
}

export interface SubtaskEdge {
  from: string;
  to: string;
}

export interface SubtaskDAG {
  subtasks: Subtask[];
  edges: SubtaskEdge[];
}

export interface CriticVerdict {
  passed: boolean;
  feedback: string;
  score: number;
}

export interface ContainerConfig {
  imageName: string;
  containerName: string;
  networkName: string;
  cpuLimit: number;
  memoryMb: number;
  timeoutSec: number;
  env: Record<string, string>;
}

export interface StartupPayload {
  subtaskId: string;
  taskId: string;
  role: AgentRole;
  description: string;
  tools: ToolName[];
  peers: Record<string, string>;
  orchestratorUrl: string;
}

export interface AgentResult {
  subtaskId: string;
  success: boolean;
  output: string;
  error: string | null;
  artifacts: Artifact[];
}

export interface Artifact {
  name: string;
  content: string;
  contentType: string;
}

export interface AgentMessage {
  from: string;
  to: string;
  type: "request" | "response" | "broadcast";
  payload: unknown;
}

export type LogStream = "stdout" | "stderr" | "system";

export interface LogEntry {
  id: string;
  subtaskId: string;
  stream: LogStream;
  line: string;
  timestamp: string;
}

export type ModelProvider = "openai" | "anthropic";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  provider?: ModelProvider;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ChatWithToolsOptions extends ChatOptions {
  tools: ToolDefinition[];
}

export interface ChatWithToolsResponse extends ChatResponse {
  toolCalls: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface OrcConfig {
  models: {
    orchestrator: string;
    subAgent: string;
    critic: string;
    synthesizer: string;
  };
  docker: {
    socketPath: string;
    imageName: string;
    imageTag: string;
    defaultCpu: number;
    defaultMemoryMb: number;
    defaultTimeoutSec: number;
  };
  retry: {
    maxAttempts: number;
  };
}
