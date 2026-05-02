import { stopContainer, removeContainer } from "./container.js";
import { removeNetwork } from "./network.js";

export async function cleanupTask(
  _taskId: string,
  containerIds: string[],
  networkName: string,
): Promise<void> {
  for (const id of containerIds) {
    try {
      await stopContainer(id);
    } catch (err) {
      console.error(`cleanup: failed to stop container ${id}:`, err);
    }
    try {
      await removeContainer(id);
    } catch (err) {
      console.error(`cleanup: failed to remove container ${id}:`, err);
    }
  }

  try {
    await removeNetwork(networkName);
  } catch (err) {
    console.error(`cleanup: failed to remove network ${networkName}:`, err);
  }
}
