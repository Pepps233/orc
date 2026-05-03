import { useState, useCallback, useRef } from "react";
import type { Subtask, LogEntry } from "../../types.js";

export interface Event {
  timestamp: string;
  message: string;
}

export interface PipelineState {
  taskPrompt: string;
  subtasks: Subtask[];
  selectedSubtaskIndex: number;
  logs: Map<string, LogEntry[]>;
  events: Event[];
  progress: { passed: number; total: number };
}

export function usePipelineState(initialPrompt: string) {
  const [state, setState] = useState<PipelineState>({
    taskPrompt: initialPrompt,
    subtasks: [],
    selectedSubtaskIndex: 0,
    logs: new Map(),
    events: [],
    progress: { passed: 0, total: 0 },
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const onSubtaskStatusChange = useCallback((subtask: Subtask) => {
    setState((prev) => {
      const existing = prev.subtasks.findIndex((s) => s.id === subtask.id);
      const subtasks = [...prev.subtasks];
      if (existing >= 0) {
        subtasks[existing] = subtask;
      } else {
        subtasks.push(subtask);
      }
      const passed = subtasks.filter((s) => s.status === "passed").length;
      return {
        ...prev,
        subtasks,
        progress: { passed, total: subtasks.length },
      };
    });
  }, []);

  const onLog = useCallback((entry: LogEntry) => {
    setState((prev) => {
      const logs = new Map(prev.logs);
      const existing = logs.get(entry.subtaskId) ?? [];
      logs.set(entry.subtaskId, [...existing, entry]);
      return { ...prev, logs };
    });
  }, []);

  const onEvent = useCallback((message: string) => {
    const event: Event = {
      timestamp: new Date().toISOString(),
      message,
    };
    setState((prev) => ({
      ...prev,
      events: [...prev.events.slice(-99), event],
    }));
  }, []);

  const selectSubtask = useCallback((index: number) => {
    setState((prev) => {
      if (index < 0 || index >= prev.subtasks.length) return prev;
      return { ...prev, selectedSubtaskIndex: index };
    });
  }, []);

  const getCallbacks = useCallback(
    () => ({
      onSubtaskStatusChange,
      onLog,
      onEvent,
    }),
    [onSubtaskStatusChange, onLog, onEvent],
  );

  return {
    state,
    selectSubtask,
    getCallbacks,
  };
}
