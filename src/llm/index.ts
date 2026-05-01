import type { ChatMessage, ChatOptions, ChatResponse, ChatWithToolsOptions, ChatWithToolsResponse, ModelProvider } from "../types.js";

export function detectProvider(model: string): ModelProvider {
  if (model.startsWith("claude-") || model.startsWith("anthropic/")) {
    return "anthropic";
  }
  return "openai";
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions,
): Promise<ChatResponse> {
  const provider = options.provider ?? detectProvider(options.model);

  if (provider === "anthropic") {
    const { chatAnthropic } = await import("./anthropic.js");
    return chatAnthropic(messages, options);
  }

  const { chatOpenAI } = await import("./openai.js");
  return chatOpenAI(messages, options);
}

export async function chatWithTools(
  messages: ChatMessage[],
  options: ChatWithToolsOptions,
): Promise<ChatWithToolsResponse> {
  const provider = options.provider ?? detectProvider(options.model);

  if (provider === "anthropic") {
    const { chatAnthropicWithTools } = await import("./anthropic.js");
    return chatAnthropicWithTools(messages, options);
  }

  const { chatOpenAIWithTools } = await import("./openai.js");
  return chatOpenAIWithTools(messages, options);
}
