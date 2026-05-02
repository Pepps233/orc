export async function httpCallTool(args: Record<string, unknown>): Promise<string> {
  const url = args.url as string;
  const method = ((args.method as string) || "GET").toUpperCase();
  const headers = (args.headers as Record<string, string>) || {};
  const body = args.body as string | undefined;

  if (!url) {
    return "Error: 'url' argument is required";
  }

  try {
    const fetchOptions: RequestInit = { method, headers };
    if (body && method !== "GET" && method !== "HEAD") {
      fetchOptions.body = body;
    }
    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    return `HTTP ${response.status} ${response.statusText}\n${text}`;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return `HTTP request failed to '${url}': ${message}`;
  }
}
