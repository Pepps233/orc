import React from "react";
import { Box, Text } from "ink";

interface ProgressBarProps {
  passed: number;
  total: number;
}

export function ProgressBar({ passed, total }: ProgressBarProps) {
  if (total === 0) {
    return (
      <Box>
        <Text dimColor>Waiting for subtasks...</Text>
      </Box>
    );
  }

  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const barWidth = 30;
  const filled = Math.round((passed / total) * barWidth);
  const empty = barWidth - filled;

  const pctColor =
    percentage >= 100 ? "green" : percentage >= 50 ? "yellow" : "red";

  return (
    <Box>
      <Text color={pctColor}>
        {"█".repeat(filled)}
        {"░".repeat(empty)}
        {" "}
        {percentage}%{"  "}
      </Text>
      <Text>
        ({passed}/{total} subtasks passed)
      </Text>
    </Box>
  );
}
