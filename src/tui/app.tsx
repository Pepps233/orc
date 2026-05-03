import React, { useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { usePipelineState, type PipelineState, type Event } from "./hooks/use-pipeline-state.js";
import { ProgressBar } from "./components/progress-bar.js";
import { SubtaskList } from "./components/subtask-list.js";
import { LogPanel } from "./components/log-panel.js";
import { EventFeed } from "./components/event-feed.js";
import type { PipelineCallbacks } from "../orchestrator/index.js";
import type { Subtask, LogEntry } from "../types.js";

interface AppProps {
  prompt: string;
  onPipelineReady: (callbacks: PipelineCallbacks) => void;
}

export default function App({ prompt, onPipelineReady }: AppProps) {
  const { state, selectSubtask, getCallbacks } = usePipelineState(prompt);

  useEffect(() => {
    const callbacks = getCallbacks();
    onPipelineReady(callbacks);
  }, []);

  useInput((input, key) => {
    if (key.upArrow) {
      selectSubtask(state.selectedSubtaskIndex - 1);
    } else if (key.downArrow) {
      selectSubtask(state.selectedSubtaskIndex + 1);
    }
  });

  const selectedSubtask = state.subtasks[state.selectedSubtaskIndex];
  const selectedLogs = selectedSubtask
    ? state.logs.get(selectedSubtask.id) ?? []
    : [];

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold>
          ORC — "
        </Text>
        <Text bold italic>
          {state.taskPrompt.length > 60
            ? state.taskPrompt.slice(0, 57) + "..."
            : state.taskPrompt}
        </Text>
        <Text bold>
          "
        </Text>
      </Box>

      {/* Progress Bar */}
      <Box marginBottom={1}>
        <ProgressBar
          passed={state.progress.passed}
          total={state.progress.total}
        />
      </Box>

      {/* Divider */}
      <Box marginBottom={1}>
        <Text dimColor>
          {"─".repeat(80)}
        </Text>
      </Box>

      {/* Middle Row: Subtasks | Logs */}
      <Box flexDirection="row" height={16}>
        {/* Subtask Panel */}
        <Box
          flexDirection="column"
          width={35}
          borderStyle="single"
          paddingX={1}
          marginRight={1}
        >
          <Text bold>Subtasks</Text>
          <Box>
            <Text dimColor>
              {"─".repeat(31)}
            </Text>
          </Box>
          <SubtaskList
            subtasks={state.subtasks}
            selectedIndex={state.selectedSubtaskIndex}
            onSelect={selectSubtask}
          />
        </Box>

        {/* Log Panel */}
        <Box
          flexDirection="column"
          flexGrow={1}
          borderStyle="single"
          paddingX={1}
        >
          <LogPanel
            subtask={selectedSubtask}
            logs={selectedLogs}
            maxHeight={12}
          />
        </Box>
      </Box>

      {/* Event Feed */}
      <Box
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        paddingX={1}
        height={8}
      >
        <EventFeed events={state.events} maxEvents={5} />
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text dimColor>
          Ctrl+C to abort  │  ↑↓ navigate subtasks  │  Status:{" "}
          {state.subtasks.length > 0
            ? `${state.progress.passed}/${state.progress.total} passed`
            : "decomposing..."}
        </Text>
      </Box>
    </Box>
  );
}
