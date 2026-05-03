import { render } from "ink";
import React from "react";
import App from "../../tui/app.js";
import { runPipeline, type PipelineCallbacks } from "../../orchestrator/index.js";

export async function runRun(prompt: string): Promise<void> {
  const { waitUntilExit } = render(
    React.createElement(App, {
      prompt,
      onPipelineReady: (callbacks: PipelineCallbacks) => {
        runPipeline(prompt, callbacks).then((result) => {
          callbacks.onEvent(`Result: ${result}`);
        }).catch((err) => {
          callbacks.onEvent(`Error: ${String(err)}`);
        });
      },
    }),
  );

  await waitUntilExit();
}
