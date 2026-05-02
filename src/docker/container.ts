import Docker from "dockerode";
import type { ContainerConfig } from "../types.js";

const docker = new Docker();

export async function createContainer(
  config: ContainerConfig,
): Promise<string> {
  const container = await docker.createContainer({
    name: config.containerName,
    Image: config.imageName,
    Hostname: config.containerName,
    Env: Object.entries(config.env).map(([k, v]) => `${k}=${v}`),
    HostConfig: {
      NetworkMode: config.networkName,
      CpuShares: Math.round(config.cpuLimit * 1024),
      Memory: config.memoryMb * 1024 * 1024,
      ReadonlyRootfs: true,
      AutoRemove: false,
    },
  });

  return container.id;
}

export async function startContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.start();
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.stop().catch((err) => {
    console.error(`docker: failed to stop container ${containerId}:`, err);
  });
}

export async function removeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.remove({ force: true }).catch((err) => {
    console.error(`docker: failed to remove container ${containerId}:`, err);
  });
}

export async function getContainerLogs(containerId: string): Promise<string> {
  const container = docker.getContainer(containerId);
  const buffer = await container.logs({
    stdout: true,
    stderr: true,
    tail: 500,
    timestamps: false,
  });

  const lines: string[] = [];
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 8);
    const size = header.readUInt32BE(4);
    offset += 8;
    if (offset + size <= buffer.length) {
      lines.push(buffer.subarray(offset, offset + size).toString("utf-8"));
      offset += size;
    } else {
      break;
    }
  }
  return lines.join("");
}
