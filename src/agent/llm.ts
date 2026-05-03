import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type {
  ChatMessage,
  ChatWithToolsOptions,
  ChatWithToolsResponse,
  ToolCall,
  ModelProvider,
} from "./types.js";

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export function detectProvider(model: string): ModelProvider {
  if (model.startsWith("claude-") || model.startsWith("anthropic/")) {
    return "anthropic";
  }
  return "openai";
}

export async function chatWithTools(
  messages: ChatMessage[],
  options: ChatWithToolsOptions,
): Promise<ChatWithToolsResponse> {
  const provider = options.provider ?? detectProvider(options.model);

  if (provider === "anthropic") {
    return chatAnthropicWithTools(messages, options);
  }
  return chatOpenAIWithTools(messages, options);
}

async function chatOpenAIWithTools(
  messages: ChatMessage[],
  options: ChatWithToolsOptions,
): Promise<ChatWithToolsResponse> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: options.model,
    messages: messages.map((m) => ({
      role: (m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user") as "system" | "user" | "assistant",
      content: m.content,
    })),
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    tools: options.tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters as Record<string, unknown>,
      },
    })),
  });

  const choice = response.choices[0]?.message;
  const toolCalls: ToolCall[] =
    choice?.tool_calls?.map((tc) => {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = {};
      }
      return {
        id: tc.id,
        name: tc.function.name,
        arguments: args,
      };
    }) ?? [];

  return {
    content: choice?.content ?? "",
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    },
    toolCalls,
  };
}

async function chatAnthropicWithTools(
  messages: ChatMessage[],
  options: ChatWithToolsOptions,
): Promise<ChatWithToolsResponse> {
  const client = getAnthropicClient();

  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  const anthropicMessages: Anthropic.MessageParam[] = [];
  for (const msg of nonSystemMessages) {
    if (msg.role === "user") {
      anthropicMessages.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      anthropicMessages.push({ role: "assistant", content: msg.content });
    }
  }

  const response = await client.messages.create({
    model: options.model,
    max_tokens: options.maxTokens ?? 4096,
    system: systemMessages.map((m) => m.content).join("\n\n") || undefined,
    messages: anthropicMessages,
    temperature: options.temperature,
    tools: options.tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool.InputSchema,
    })),
  });

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const toolCalls: ToolCall[] = response.content
    .filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use")
    .map((block) => ({
      id: block.id,
      name: block.name,
      arguments: block.input as Record<string, unknown>,
    }));

  return {
    content: textContent,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    toolCalls,
  };
}
