# vf-framework-mcp

Docs-first backlog/planning framework (idea → epics → features → tasks → work packages) packaged as an **MCP server**.

This repo provides:
- **MCP prompts**: pipeline stages loaded from `./prompts/*.md`
- **MCP tools**: helper ops to enforce a predictable on-disk structure (create idea folders, start runs, read/write artifacts, append logs)

**Windows-first** instructions.

---

## What this writes (contract)

In the *target project repository* (the repo where you run Claude Code / Codex), the framework writes under:

`docs/forge/ideas/<IDEA_ID>/...`

Typical idea workspace:

```
docs/forge/ideas/<IDEA_ID>/
  inputs/
    idea.md
    imagine_questions.md
    imagine_answers.md
    normalizer_answers.md
  latest/
    idea_normalized.md
    epics.md
    features.md
    tasks.md
    work_packages.md
    validations/
      validate_epics.md
      validate_features.md
      validate_tasks.md
  runs/
    <RUN_ID>/
      outputs/
        idea_normalized.md
        epics.md
        features.md
        tasks.md
        work_packages.md
      validations/
        validate_epics.md
        validate_features.md
        validate_tasks.md
      notes.md
  manifest.md
  run_log.md
```

### Prompt naming
Prompt names come from:
- `name:` in YAML frontmatter, if present
- otherwise the filename stem (e.g. `imagine.md` → `imagine`)

In Claude Code UI, MCP prompts are typically shown namespaced by server, e.g. `/vf:imagine (MCP)`.

---

## Requirements

- Node.js 18+ (Windows)
- An MCP-capable host:
  - Claude Code (CLI / VS Code extension)
  - OpenAI Codex (CLI / VS Code extension)

---

## Install (Windows)

### Option A: Install from GitHub (recommended while iterating)

From any machine:

```powershell
npm i -g github:Darkpunkki/VibeForge
```

This creates a global executable command (via package.json `bin`):
- `vf-framework-mcp`


### Option B: Local dev install (when hacking on the server)

From the framework repo folder:

```powershell
npm install
npm run build
npm i -g .
```

---

## Use with Claude Code (project-scoped)

In your *target project repo* root, create `.mcp.json`:

```json
{
  "mcpServers": {
    "vf": {
      "command": "vf-framework-mcp",
      "args": []
    }
  }
}
```

Then:

```powershell
cd C:\path\to\target-project
claude
```

In Claude Code:
- run `/mcp` to confirm the server is connected (and approve it if prompted)
- run prompts, e.g.:
  - `/vf:imagine (MCP) build a docs-first backlog generator`
  - `/vf:Summarize (MCP) IDEA-0001-my-idea`

---

## Use with OpenAI Codex (CLI)

Codex reads MCP servers from:

`%USERPROFILE%\.codex\config.toml`

### Add via `config.toml`

Add a section like:

```toml
[mcp_servers.vf]
command = "vf-framework-mcp"
args = []
```

Then run Codex:

```powershell
codex
```

### Add via CLI helper

Codex also supports managing MCP servers via:

```powershell
codex mcp
```

---

## First-run sanity test (recommended)

1) In a fresh target repo, ensure you have `.mcp.json` (Claude) or `config.toml` (Codex) configured.
2) Run the idea intake prompt with free-form text:
   - Claude Code: `/vf:imagine (MCP) build a calculator application`
3) Answer the questions it asks (interactive).
4) Re-run imagine with the generated IDEA_ID to finalize:
   - `/vf:imagine (MCP) IDEA-000X-some-slug`
5) Run normalizer:
   - `/vf:idea-normalizer (MCP) IDEA-000X-some-slug`
6) Confirm files exist under:
   - `docs/forge/ideas/<IDEA_ID>/inputs/idea.md`
   - `docs/forge/ideas/<IDEA_ID>/latest/idea_normalized.md`
   - `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/...`
   - `docs/forge/ideas/<IDEA_ID>/run_log.md`

---

## Troubleshooting

### Prompt doesn’t appear / YAML frontmatter issues
If a prompt has invalid YAML frontmatter, it may not load correctly. In particular:
- avoid nested quotes in `argument-hint`
- use block scalars for long strings, e.g.:

```yaml
argument-hint: >-
  <free text OR IDEA-0001-something> (examples: build X | IDEA-0001-x)
```

### Server prints to stdout
MCP STDIO uses stdout for protocol messages. Logging should go to stderr only.

### Windows path/cwd confusion
This MCP server writes relative to the *target repo current working directory* used by the host.
If files are being written in the wrong place, verify:
- Claude Code was launched in the target repo folder
- `.mcp.json` is in the target repo root
- Codex is using the correct user profile and config.toml
