import express from "express";
import type { StartupPayload, AgentResult, AgentMessage } from "./types.js";
import { runAgentLoop } from "./loop.js";

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || "3000", 10);

let isRunning = false;
const peerMessageQueue: AgentMessage[] = [];

app.get("/health", (_req, res) => {
  res.json({ status: isRunning ? "busy" : "ready" });
});

app.post("/task", async (req, res) => {
  if (isRunning) {
    res.status(409).json({ error: "Agent is already running a task" });
    return;
  }

  const payload = req.body as StartupPayload;

  if (!payload.subtaskId || !payload.taskId || !payload.description) {
    res.status(400).json({ error: "Invalid startup payload: subtaskId, taskId, and description are required" });
    return;
  }

  isRunning = true;
  res.status(202).json({ status: "accepted", subtaskId: payload.subtaskId });

  let result: AgentResult;

  try {
    const queuedMessages = [...peerMessageQueue];
    peerMessageQueue.length = 0;
    result = await runAgentLoop(payload, queuedMessages);
  } catch (err: unknown) {
    result = {
      subtaskId: payload.subtaskId,
      success: false,
      output: "",
      error: err instanceof Error ? err.message : String(err),
      artifacts: [],
    };
  }

  try {
    await fetch(payload.orchestratorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to POST result to orchestrator: ${message}`);
  }

  peerMessageQueue.length = 0;
  isRunning = false;
});

app.post("/message", (req, res) => {
  const msg = req.body as AgentMessage;

  if (!msg.from || !msg.to || !msg.type) {
    res.status(400).json({ error: "Invalid message: from, to, and type are required" });
    return;
  }

  peerMessageQueue.push(msg);
  res.status(202).json({ status: "queued" });
});

const server = app.listen(PORT, () => {
  console.log(`Agent server listening on port ${PORT}`);
});

function gracefulShutdown() {
  console.log("Received shutdown signal, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.log("Forcing exit after timeout");
    process.exit(1);
  }, 5000);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { app };
