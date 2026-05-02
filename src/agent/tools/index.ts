import type { ToolHandler, ToolDefinition } from "../types.js";
import { readFileTool } from "./read-file.js";
import { writeFileTool } from "./write-file.js";
import { runShellTool } from "./run-shell.js";
import { gitDiffTool } from "./git-diff.js";
import { httpCallTool } from "./http-call.js";

const handlers: Record<string, ToolHandler> = {
  read_file: readFileTool,
  write_file: writeFileTool,
  run_shell: runShellTool,
  git_diff: gitDiffTool,
  http_call: httpCallTool,
};

const definitions: Record<string, ToolDefinition> = {
  read_file: {
    name: "read_file",
    description: "Read the contents of a file from the shared workspace",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the file to read" },
      },
      required: ["path"],
    },
  },
  write_file: {
    name: "write_file",
    description: "Write content to a file in the shared workspace",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to write the file to" },
        content: { type: "string", description: "Content to write" },
      },
      required: ["path", "content"],
    },
  },
  run_shell: {
    name: "run_shell",
    description: "Execute a shell command",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "The shell command to execute" },
        cwd: { type: "string", description: "Working directory (optional)" },
        timeout: { type: "number", description: "Timeout in milliseconds (optional, default 30000)" },
      },
      required: ["command"],
    },
  },
  git_diff: {
    name: "git_diff",
    description: "Run git diff to see changes in the workspace",
    parameters: {
      type: "object",
      properties: {
        cwd: { type: "string", description: "Working directory (optional)" },
      },
      required: [],
    },
  },
  http_call: {
    name: "http_call",
    description: "Make an HTTP request to a peer agent or external URL",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to request" },
        method: { type: "string", description: "HTTP method (GET, POST, etc.)" },
        headers: { type: "object", description: "Request headers" },
        body: { type: "string", description: "Request body" },
      },
      required: ["url"],
    },
  },
};

export function getTool(name: string): ToolHandler | undefined {
  return handlers[name];
}

export function getToolDefinitions(names: string[]): ToolDefinition[] {
  return names.map((n) => definitions[n]).filter(Boolean);
}

export function getAllToolNames(): string[] {
  return Object.keys(handlers);
}
