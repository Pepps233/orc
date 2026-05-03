import React from "react";
import { Box, Text } from "ink";
import type { Subtask, LogEntry } from "../../types.js";

interface LogPanelProps {
  subtask: Subtask | undefined;
  logs: LogEntry[];
  maxHeight: number;
}

function streamColor(stream: string): string {
  switch (stream) {
    case "stderr":
      return "red";
    case "system":
      return "yellow";
    case "stdout":
    default:
      return "white";
  }
}

function streamPrefix(stream: string): string {
  switch (stream) {
    case "stderr":
      return "ERR";
    case "system":
      return "SYS";
    case "stdout":
    default:
      return "OUT";
  }
}

export function LogPanel({ subtask, logs, maxHeight }: LogPanelProps) {
  if (!subtask) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text dimColor>Select a subtask to view logs</Text>
      </Box>
    );
  }

  const visibleLogs = logs.slice(-maxHeight);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>
          Logs — {subtask.role} ({subtask.id.slice(0, 8)})
        </Text>
      </Box>
      {visibleLogs.length === 0 ? (
        <Text dimColor>No logs yet...</Text>
      ) : (
        visibleLogs.map((log, i) => (
          <Box key={`${log.id}-${i}`}>
            <Text color={streamColor(log.stream)}>
              [{streamPrefix(log.stream)}]{" "}
            </Text>
            <Text>{log.line}</Text>
          </Box>
        ))
      )}
    </Box>
  );
}
