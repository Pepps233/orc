import { initialize } from "../../db/index.js";

export async function runInit(): Promise<void> {
  console.log("orc init - setting up the ORC environment...\n");

  initialize();
  console.log("Created ~/.orc/orc.db (SQLite database)\n");

  console.log("Checking configuration...");
  const { loadConfig } = await import("../config.js");
  const config = loadConfig();
  console.log(`  LLM orchestrator model: ${config.models.orchestrator}`);
  console.log(`  LLM sub-agent model:   ${config.models.subAgent}`);
  console.log(`  Docker image:           ${config.docker.imageName}:${config.docker.imageTag}`);
  console.log(`  Retry max attempts:     ${config.retry.maxAttempts}`);
  console.log();

  console.log("ORC is ready. Run 'orc run \"your task\"' to get started.");
}
