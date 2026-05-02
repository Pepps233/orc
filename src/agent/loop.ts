import type { StartupPayload, AgentResult, AgentMessage, ChatMessage } from "./types.js";
import { chatWithTools } from "./llm.js";
import { getTool, getToolDefinitions } from "./tools/index.js";

const MAX_ITERATIONS = 15;
const DEFAULT_MODEL = process.env.ORC_MODEL_SUB_AGENT || "claude-sonnet-4-6";

export async function runAgentLoop(
  payload: StartupPayload,
  peerMessages: AgentMessage[],
): Promise<AgentResult> {
  const startTime = Date.now();

  const roleName = payload.role.replace(/-/g, " ");
  const toolNames = payload.tools.join(", ");
  const peerList = Object.entries(payload.peers)
    .map(([name, addr]) => `  - ${name} at http://${addr}`)
    .join("\n");

  const systemPrompt = `You are a specialized sub-agent with the role: ${roleName}.

Your task is described by the user. Execute it thoroughly using the tools available to you:
${toolNames ? `  ${toolNames}` : "  (no tools assigned)"}

${
  peerList
    ? `You can communicate with peer agents via the http_call tool:\n${peerList}`
    : ""
}

Instructions:
- Read the task description carefully and plan your approach.
- Use tools as needed to complete the task.
- When you have a final answer, respond with the result as plain text. Do NOT request more tool calls.
- If you encounter an error, explain what went wrong and how to fix it.
- Be concise but complete in your final response.`;

  const userMessages: ChatMessage[] = [{ role: "user", content: payload.description }];

  for (const pm of peerMessages) {
    userMessages.push({
      role: "user",
      content: `[Message from ${pm.from} (type: ${pm.type})]: ${JSON.stringify(pm.payload)}`,
    });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...userMessages,
  ];

  const toolDefs = getToolDefinitions(payload.tools);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await chatWithTools(messages, {
      model: DEFAULT_MODEL,
      tools: toolDefs,
      maxTokens: 4096,
    });

    if (response.toolCalls.length > 0) {
      messages.push({
        role: "assistant",
        content: response.content || "(tool calls requested)",
      });

      for (const tc of response.toolCalls) {
        const tool = getTool(tc.name);
        let result: string;
        if (tool) {
          try {
            result = await tool(tc.arguments);
          } catch (err: unknown) {
            result = `Tool error: ${err instanceof Error ? err.message : String(err)}`;
          }
        } else {
          result = `Unknown tool: ${tc.name}`;
        }

        messages.push({
          role: "user",
          content: `Tool result for ${tc.name}(${JSON.stringify(tc.arguments)}):\n${result}`,
        });
      }
    } else {
      return {
        subtaskId: payload.subtaskId,
        success: true,
        output: response.content,
        error: null,
        artifacts: [],
      };
    }
  }

  return {
    subtaskId: payload.subtaskId,
    success: false,
    output: "",
    error: `Exceeded maximum iterations (${MAX_ITERATIONS}) without producing a final answer`,
    artifacts: [],
  };
}
