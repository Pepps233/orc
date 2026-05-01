import type { OrcConfig } from "./types.js";

export function loadConfig(): OrcConfig {
  return {
    models: {
      orchestrator:
        process.env.ORC_MODEL_ORCHESTRATOR ?? "claude-sonnet-4-6",
      subAgent: process.env.ORC_MODEL_SUB_AGENT ?? "claude-sonnet-4-6",
      critic: process.env.ORC_MODEL_CRITIC ?? "claude-sonnet-4-6",
      synthesizer: process.env.ORC_MODEL_SYNTHESIZER ?? "claude-sonnet-4-6",
    },
    docker: {
      socketPath: process.env.ORC_DOCKER_SOCKET ?? "/var/run/docker.sock",
      imageName: process.env.ORC_DOCKER_IMAGE ?? "orc-agent",
      imageTag: process.env.ORC_DOCKER_IMAGE_TAG ?? "latest",
      defaultCpu: parseFloat(process.env.ORC_DOCKER_CPU ?? "1.0"),
      defaultMemoryMb: parseInt(process.env.ORC_DOCKER_MEMORY_MB ?? "512", 10),
      defaultTimeoutSec: parseInt(
        process.env.ORC_DOCKER_TIMEOUT_SEC ?? "300",
        10,
      ),
    },
    retry: {
      maxAttempts: parseInt(process.env.ORC_RETRY_MAX_ATTEMPTS ?? "3", 10),
    },
  };
}
