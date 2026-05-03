import { readFile } from "node:fs/promises";

export async function readFileTool(args: Record<string, unknown>): Promise<string> {
  const filePath = args.path as string;
  if (!filePath) {
    return "Error: 'path' argument is required";
  }
  try {
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error reading file '${filePath}': ${message}`;
  }
}
