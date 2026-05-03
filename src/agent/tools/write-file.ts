import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeFileTool(args: Record<string, unknown>): Promise<string> {
  const filePath = args.path as string;
  const content = args.content as string;
  if (!filePath) {
    return "Error: 'path' argument is required";
  }
  if (content === undefined || content === null) {
    return "Error: 'content' argument is required";
  }
  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf-8");
    return `File written: ${filePath}`;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error writing file '${filePath}': ${message}`;
  }
}
