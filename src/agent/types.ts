export type AgentRole = string;
export type ToolName = string;

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

export type ToolHandler = (args: Record<string, unknown>) => Promise<string>;
