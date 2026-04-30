# orc

A local CLI tool that turns natural language coding tasks into fully executed workflows. An LLM-powered orchestrator decomposes your task into a dependency graph of subtasks, runs each in an isolated Docker container with its own agent, reviews the output with a critic, and synthesizes the final result — all displayed in an interactive terminal dashboard.

## Prerequisites

- Node.js >= 22
- Docker Engine running locally
- An API key for at least one LLM provider:
  - OpenAI (`OPENAI_API_KEY`)
  - Anthropic (`ANTHROPIC_API_KEY`)

## Installation

```bash
git clone https://github.com/Pepps233/orc.git
cd orc
npm install
npm run build
npm link
```

Pull or build the universal agent image:

```bash
orc init
```

## Usage

```bash
orc run "fix the race condition in connection_pool.py"
```

This opens the TUI dashboard where you can watch subtask execution in real time — containers spinning up, agent outputs streaming, the critic passing or failing each subtask, and the final synthesized result.

### Other commands

```bash
orc history          # Browse past task runs
orc inspect <id>     # Replay logs from a specific task
```

## How it works

1. **Orchestrator agent** receives your natural language task and calls an LLM to decompose it into a directed acyclic graph (DAG) of subtasks. Each subtask gets a role, a toolset, resource limits, and a list of peer addresses.

2. **Sub-agent containers** boot from a universal image (Python 3.12 + Node 22 + shell). Each container receives a startup JSON payload defining its role and tools, then runs an agent loop — call LLM, use tools, produce output — over HTTP on a Docker bridge network.

3. **Critic agent** reviews each subtask output as it completes. If the output passes review, downstream subtasks in the DAG unblock. If it fails, the subtask is retried with the critic's feedback as additional context (up to 2 retries).

4. **Synthesis agent** aggregates all passing subtask results into a final coherent answer and returns it to the terminal.

## Architecture

```
Orchestrator (in-process)
  |
  |-- Sub-agent container A --(output)--> Sub-agent container B
  |       |                    B depends on A's result
  |       v
  |   Critic reviews A -- pass? --> B unblocks
  |       | fail? --> retry A with context
  |
  |-- Sub-agent container C (independent)
  |
  v
Critic + Synthesis (in-process) --> final answer
```

All agents communicate via HTTP on a per-task Docker bridge network. Task history and logs are persisted locally in SQLite at `~/.orc/orc.db`.

## Configuration

Set API keys via environment variables or a `.env` file:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Resource defaults (CPU, memory, timeout per container) can be overridden in `~/.orc/config.yaml`.
