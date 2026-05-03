#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("orc")
  .description("Multi-agent code execution pipeline")
  .version("0.1.0");

program
  .command("run <prompt>")
  .description("Run a task through the agent pipeline")
  .action(async (prompt: string) => {
    const { runRun } = await import("./commands/run.js");
    await runRun(prompt);
  });

program
  .command("history")
  .description("List past tasks")
  .action(async () => {
    const { runHistory } = await import("./commands/history.js");
    await runHistory();
  });

program
  .command("inspect <id>")
  .description("Inspect a past task")
  .action(async (id: string) => {
    const { runInspect } = await import("./commands/inspect.js");
    await runInspect(id);
  });

program
  .command("init")
  .description("First-time setup")
  .action(async () => {
    const { runInit } = await import("./commands/init.js");
    await runInit();
  });

program.parse();
