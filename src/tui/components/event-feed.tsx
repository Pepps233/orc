import React from "react";
import { Box, Text } from "ink";
import type { Event } from "../hooks/use-pipeline-state.js";

interface EventFeedProps {
  events: Event[];
  maxEvents: number;
}

export function EventFeed({ events, maxEvents }: EventFeedProps) {
  const visible = events.slice(-maxEvents);

  if (visible.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold>Events</Text>
        <Text dimColor>Waiting for events...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>Events</Text>
      <Box flexDirection="column">
        {visible.map((ev, i) => {
          const time = ev.timestamp.slice(11, 19);
          return (
            <Box key={i}>
              <Text dimColor>{time}  </Text>
              <Text>{ev.message}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
