# VibeForge

**Docs-first planning framework**: Transform ideas into structured, executable work packages using an AI-powered pipeline.

`Idea → Concept → Epics → Features → Tasks → Work Packages → Execution`

Packaged as an **MCP server** for [Claude Code](https://claude.ai/code) and similar tools.

---

## What is VibeForge?

VibeForge is a framework that helps you:
1. Take a rough idea or plan document
2. Break it down into structured epics, features, and tasks
3. Generate executable work packages
4. Track implementation progress

All outputs are stored as markdown files in your project under `docs/forge/ideas/<IDEA_ID>/`.

---

## Requirements

- **Windows** (primary support)
- **Node.js 18+**
- **Claude Code** or compatible MCP host

---

## Installation (Windows)

### Step 1: Install VibeForge globally

Open PowerShell and run:

```powershell
npm install -g github:Darkpunkki/VibeForge
```

This installs the `vf-framework-mcp` command globally.

### Step 2: Verify installation

```powershell
vf-framework-mcp
```

You should see: `[vf-framework-mcp] Ready: VibeForge Framework (Docs-first) v0.0.1`

Press `Ctrl+C` to stop it (it's an MCP server, so it runs continuously).

✅ Installation complete!

---

## Quick Start

### 1. Configure Your Project

In your project's root directory, create a file named `.mcp.json`:

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

### 2. Launch Claude Code

```powershell
cd C:\path\to\your-project
claude
```

### 3. Verify MCP Connection

In Claude Code, run:

```
/mcp
```

You should see:
```
✓ vf · connected
```

If you see `✘ failed`, see [Troubleshooting](#troubleshooting) below.

### 4. Start the Pipeline

Run the `/imagine` prompt with your idea:

```
/vf:imagine (MCP) Build a task management app with tags and due dates
```

The prompt will:
- Create a new idea folder (e.g., `IDEA-0001-task-app`)
- Ask clarifying questions
- Generate a draft `idea.md`
- Wait for your answers
- Finalize the idea document

### 5. Continue Through the Pipeline

Once your idea is finalized, run these commands in sequence:

```
/vf:idea-normalizer (MCP) IDEA-0001-task-app
/vf:concept-summarizer (MCP) IDEA-0001-task-app
/vf:epic-extractor (MCP) IDEA-0001-task-app
/vf:validate-epics (MCP) IDEA-0001-task-app
/vf:feature-extractor (MCP) IDEA-0001-task-app
/vf:validate-features (MCP) IDEA-0001-task-app
/vf:task-builder (MCP) IDEA-0001-task-app
/vf:validate-tasks (MCP) IDEA-0001-task-app
```

### 6. Generate and Execute Work Packages

Queue work packages:

```
/vf:into-wps (MCP) IDEA-0001-task-app 3
```

Execute work:

```
/vf:work-wp (MCP)
```

---

## What Gets Created in Your Project

```
your-project/
├── .mcp.json                     # MCP server configuration
└── docs/
    └── forge/
        └── ideas/
            └── IDEA-0001-task-app/
                ├── inputs/
                │   ├── idea.md                      # Your finalized idea
                │   ├── imagine_questions.md
                │   └── imagine_answers.md
                ├── latest/
                │   ├── idea_normalized.md
                │   ├── concept_summary.md
                │   ├── epics.md                     # Generated epics
                │   ├── features.md                  # Generated features
                │   └── tasks.md                     # Generated tasks
                ├── runs/
                │   └── <timestamp>/                 # Historical runs
                ├── manifest.md                      # Status tracking
                └── run_log.md                       # Audit log
```

---

## Available Pipeline Commands

| Command | Purpose |
|---------|---------|
| `/vf:imagine (MCP)` | Start a new idea or refine existing |
| `/vf:idea-normalizer (MCP)` | Normalize and structure the idea |
| `/vf:concept-summarizer (MCP)` | Create semantic anchor summary |
| `/vf:epic-extractor (MCP)` | Extract high-level epics |
| `/vf:validate-epics (MCP)` | Validate epic structure |
| `/vf:feature-extractor (MCP)` | Break epics into features |
| `/vf:validate-features (MCP)` | Validate features |
| `/vf:task-builder (MCP)` | Generate actionable tasks |
| `/vf:validate-tasks (MCP)` | Validate task structure |
| `/vf:into-wps (MCP)` | Queue work packages |
| `/vf:work-wp (MCP)` | Execute a work package |

---

## Troubleshooting

### ✘ MCP Connection Failed

**Problem:** `/mcp` shows `✘ vf · failed`

**Solution:**

1. **Verify installation from PowerShell** (not Git Bash):
   ```powershell
   Get-Command vf-framework-mcp
   ```

2. **If command not found, reinstall:**
   ```powershell
   npm uninstall -g vf-framework-mcp
   npm install -g github:Darkpunkki/VibeForge
   ```

3. **Verify all wrapper files exist:**
   ```powershell
   ls $env:APPDATA\npm\vf-framework-mcp*
   ```

   You should see three files:
   - `vf-framework-mcp` (bash)
   - `vf-framework-mcp.cmd` (CMD)
   - `vf-framework-mcp.ps1` (PowerShell)

4. **Restart Claude Code** and try `/mcp` again.

### Files Created in Wrong Location

**Problem:** Files are being written outside your project folder.

**Solution:**
- Ensure Claude Code was launched from your project's root directory
- Verify `.mcp.json` exists in your project root
- Restart Claude Code in the correct directory

### Prompts Not Appearing

**Problem:** `/vf:` prompts don't autocomplete.

**Solution:**
- Run `/mcp` to verify connection status
- If connected, wait a few seconds and try again
- Restart Claude Code if the issue persists

---

## Documentation

- **[Pipeline Usage Guide](./vibeforge_pipeline_usage.md)** - Detailed workflow and command reference
- **[Example Workflow](./vibeforge_pipeline_usage.md#9-example-end-to-end-session-copypaste)** - Copy-paste session example

---

## Development

### Local Development Setup

If you want to modify VibeForge itself:

```powershell
git clone https://github.com/Darkpunkki/VibeForge.git
cd VibeForge
npm install
npm run build
npm install -g .
```

After making changes, rebuild and reinstall:

```powershell
npm run build
npm install -g .
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/Darkpunkki/VibeForge/issues)
- **Repository:** [github.com/Darkpunkki/VibeForge](https://github.com/Darkpunkki/VibeForge)

---

## License

MIT
