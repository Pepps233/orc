import React from "react";
import { Box, Text } from "ink";
import type { Subtask } from "../../types.js";

interface SubtaskListProps {
  subtasks: Subtask[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function statusIcon(status: string): string {
  switch (status) {
    case "passed":
      return "✓";
    case "failed":
      return "✗";
    case "running":
      return "⟳";
    case "blocked":
      return "⏸";
    case "retrying":
      return "↻";
    case "awaiting_review":
      return "⃝";
    case "pending":
      return "○";
    default:
      return "?";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "passed":
      return "green";
    case "failed":
      return "red";
    case "running":
      return "yellow";
    case "retrying":
      return "yellow";
    case "awaiting_review":
      return "cyan";
    case "blocked":
      return "grey";
    case "pending":
      return "grey";
    default:
      return "white";
  }
}

function formatDuration(subtask: Subtask): string {
  if (!subtask.completedAt) {
    if (subtask.status === "running" || subtask.status === "awaiting_review") {
      const start = new Date(subtask.createdAt).getTime();
      const now = Date.now();
      const sec = Math.round((now - start) / 1000);
      if (sec < 60) return `${sec}s`;
      return `${Math.floor(sec / 60)}m${sec % 60}s`;
    }
    return "";
  }
  const start = new Date(subtask.createdAt).getTime();
  const end = new Date(subtask.completedAt).getTime();
  const sec = Math.round((end - start) / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m${sec % 60}s`;
}

export function SubtaskList({
  subtasks,
  selectedIndex,
  onSelect,
}: SubtaskListProps) {
  if (subtasks.length === 0) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text dimColor>No subtasks yet. Waiting for decomposition...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {subtasks.map((sub, i) => {
        const isSelected = i === selectedIndex;
        const color = statusColor(sub.status);
        const duration = formatDuration(sub);
        const prefix = isSelected ? "▶" : " ";

        return (
          <Box key={sub.id}>
            <Text color={isSelected ? "blue" : undefined}>
              {prefix}{" "}
              <Text color={color}>{statusIcon(sub.status)}</Text>
              {"  "}
              <Text bold={isSelected}>{sub.role}</Text>
              {duration ? (
                <Text dimColor> ({duration})</Text>
              ) : null}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
