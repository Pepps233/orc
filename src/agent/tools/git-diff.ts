import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function gitDiffTool(args: Record<string, unknown>): Promise<string> {
  const cwd = (args.cwd as string) || process.cwd();
  try {
    const { stdout } = await execAsync("git diff", { cwd, timeout: 10000 });
    return stdout || "(no changes)";
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error running git diff: ${message}`;
  }
}
