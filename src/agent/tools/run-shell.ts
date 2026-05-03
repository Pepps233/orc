import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function runShellTool(args: Record<string, unknown>): Promise<string> {
  const command = args.command as string;
  if (!command) {
    return "Error: 'command' argument is required";
  }
  const cwd = (args.cwd as string) || process.cwd();
  const timeout = (args.timeout as number) || 30000;
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      maxBuffer: 10 * 1024 * 1024,
    });
    let result = "";
    if (stdout) result += stdout;
    if (stderr) result += (result ? "\n" : "") + stderr;
    return result || "(no output)";
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; message?: string };
    let result = "";
    if (execErr.stdout) result += execErr.stdout;
    if (execErr.stderr) result += (result ? "\n" : "") + execErr.stderr;
    if (!result) result = `Command failed: ${execErr.message ?? String(err)}`;
    return result;
  }
}
