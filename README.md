# vf-framework-mcp

Docs-first backlog-building framework (idea → epics → features → tasks → work packages) packaged as an **MCP server**.

This repository is intentionally **separate** from your main project. You point Codex / Claude Code at your project repo as `cwd`, and this server writes to:

- `docs/forge/ideas/<IDEA_ID>/...`

## What you get (v0)

- MCP **prompts**: framework stages (normalize, generate epics, validate, etc.)
- MCP **tools**: helper ops to enforce structure:
  - ensure idea workspace
  - start run id
  - read/write artifacts
  - append run log

## Requirements

- Node.js 18+
- A host that supports MCP (Codex CLI, Claude Code, etc.)

## Install & run (dev)

```bash
npm install
npm run dev
```

## Configure in Codex

Codex can connect to MCP servers configured in `~/.codex/config.toml` or via `codex mcp`. See OpenAI Codex MCP docs.
(You usually set the server command to `npx tsx src/index.ts` and set `cwd` to your project repo root.)

## Configure in Claude Code

Claude Code supports connecting to MCP servers via its MCP configuration.
(You usually set the server command to `npx tsx src/index.ts` and set `cwd` to your project repo root.)

## Folder structure contract (written into your project)

```
docs/forge/ideas/<IDEA_ID>/
  inputs/idea.md
  inputs/normalizer_answers.md (optional)
  latest/idea_normalized.md
  runs/<RUN_ID>/idea_normalized.md
  manifest.md
  run_log.md
```

## Development notes

- **Do not write logs to stdout** when running as STDIO MCP. Use stderr.


## Prompt format

This server can load:
- MCP-style prompts with `name/title/description/inputs` frontmatter
- Claude-style command prompts with `description`, `argument-hint`, etc.

For Claude-style files, the server exposes a single input parameter:
- `arguments` (string)

In templates, `$ARGUMENTS` will be replaced with `arguments` automatically.
