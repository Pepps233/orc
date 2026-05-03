import OpenAI from "openai";
import type {
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ChatWithToolsOptions,
  ChatWithToolsResponse,
  ToolCall,
} from "../types.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatOpenAI(
  messages: ChatMessage[],
  options: ChatOptions,
): Promise<ChatResponse> {
  const response = await client.chat.completions.create({
    model: options.model,
    messages: messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
    temperature: options.temperature,
    max_tokens: options.maxTokens,
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    },
  };
}

export async function chatOpenAIWithTools(
  messages: ChatMessage[],
  options: ChatWithToolsOptions,
): Promise<ChatWithToolsResponse> {
  const response = await client.chat.completions.create({
    model: options.model,
    messages: messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
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
