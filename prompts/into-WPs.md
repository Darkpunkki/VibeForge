---
name: make-wps
description: Queue Work Package(s) from an idea's backlog (tasks → work_packages.md), intelligently grouping by files/relevance
argument-hint: "<IDEA_ID> [ALL|N|MVP|EPIC-###|--tasks TASK-001,TASK-005] ...  (examples: IDEA-0003_my-idea ALL | IDEA-0003_my-idea MVP | IDEA-0003_my-idea --tasks TASK-067,TASK-068)"
disable-model-invocation: true
---

# VibeForge — Queue Work Packages from Backlog (Tasks → WPs)

Generate and enqueue Work Package(s) in the per-idea board:

- `docs/forge/ideas/<IDEA_ID>/latest/work_packages.md`

From the canonical backlog:

- `docs/forge/ideas/<IDEA_ID>/latest/tasks.md`

This command ONLY selects tasks and appends WP entries; it must never modify the backlog tasks.

**Intended usage:**
- **Process ALL tasks** and create WPs intelligently grouping by file paths and relevance
- **Custom WP creation** from specific task IDs you select

---

## Invocation

Call with an idea folder id first:

- `/into-wps <IDEA_ID> [filters...]`

Examples:

**Process all eligible tasks:**
- `/into-wps IDEA-0003_my-idea ALL` → process all eligible tasks, create as many WPs as needed (RECOMMENDED)
- `/into-wps IDEA-0003_my-idea MVP` → process all MVP tasks only
- `/into-wps IDEA-0003_my-idea EPIC-003` → process all tasks under EPIC-003

**Create specific number of WPs:**
- `/into-wps IDEA-0003_my-idea` → enqueue 1 WP (default if no ALL flag)
- `/into-wps IDEA-0003_my-idea 3` → enqueue up to 3 new WPs

**Custom task selection:**
- `/into-wps IDEA-0003_my-idea --tasks TASK-067,TASK-068,TASK-043` → create ONE WP from these specific tasks

**Other filters:**
- `/into-wps IDEA-0003_my-idea FEAT-014` → only queue tasks under a feature
- `/into-wps IDEA-0003_my-idea WP-0007` → force-create next WP id starting at WP-0007 (rare)

Argument parsing rules (best-effort):

- `$1` = IDEA_REF (required)
- Remaining tokens in `$ARGUMENTS` may include:
  - `ALL` - process all eligible tasks (create as many WPs as needed)
  - a count `N` (integer) - create up to N WPs
  - a release filter `MVP|V1|Full|Later`
  - `EPIC-###` and/or `FEAT-###` filters
  - `--tasks TASK-001,TASK-005,...` - custom task selection (creates ONE WP)
  - a forced starting id `WP-####`

If IDEA_REF is missing, STOP and ask the user to provide it.

---

## Resolve IDEA_ID (required)

Before using any paths, resolve the idea folder:

- Call `vf.resolve_idea_id` with `idea_ref = $1`
- Store the returned `idea_id` as `IDEA_ID`
- Use `IDEA_ID` for all paths, YAML headers, and run log entries

---

## Context (loading sequence)

Load files in this order, handling missing optional files gracefully:

### Required files (read first)
1. Read `latest.tasks` using vf.read (required - STOP if missing)

### Work packages board (read or create)
2. Try to read `latest.work_packages` using vf.read
   - If missing (ENOENT), treat as empty and you'll create it later
   - Parse existing WP IDs, statuses, and task references if it exists

### Optional context for better WP titles and grouping
3. Optionally try to read `latest.features_backlog` (preferred) or `latest.features` (fallback)
   - Use for feature titles in WP names
   - If both missing, derive titles from task data
4. Optionally try to read `latest.epics_backlog` (preferred) or `latest.epics` (fallback)
   - Use for epic titles in WP names
   - If both missing, derive titles from task data
5. Optionally read `latest.PROJECT_ARCHITECTURE` (Quick Reference only) for file/module grouping context
6. Optionally read `latest.concept_summary` for additional context

**Important:** Use vf.read with kind notation (e.g., `"latest.tasks"`, not file paths). Handle ENOENT errors gracefully for optional files - if they don't exist, continue without them.

---

## Output (Auto)

Append WP entries into:

- `docs/forge/ideas/<IDEA_ID>/latest/work_packages.md`

No other files are modified by this command.

If you cannot write to the file directly, output the exact text block(s) that should be appended.

---

## Step 0 — Parse loaded context and compute queue state

1) Parse `work_packages.md` content (loaded in Context section):

If you successfully loaded it:
- Parse existing WP ids
- Parse Status (`Queued`, `In Progress`, `Blocked`, `Done`, etc.)
- Parse Referenced Task IDs (`TASK-###`) if present
- Parse any explicit dependencies and verify commands

If loading failed (ENOENT - file doesn't exist):
- Treat as empty
- You'll create it later with this minimal header:
  ```md
  # Work Packages — <IDEA_ID>

  (append new WPs below)
  ```

2) Compute:

- Next WP id = (max existing WP number + 1), unless a forced starting id is provided
- Task IDs already referenced by any existing WP (any status) to avoid duplicates

3) Queue-full check:

**If `ALL` mode is NOT active:**
- If there are already 4+ WPs with status `Queued`, STOP and report:
  - "Queue is already full; execute or plan queued WPs first."
  - List the currently queued WP ids.

**If `ALL` mode IS active:**
- Skip the queue-full check (user explicitly wants to process all tasks)

---

## Step 1 — Parse and index the backlog (tasks.md)

1) Use the `tasks.md` content already loaded in the Context section
2) Parse the canonical YAML block at the top (preferred). If missing, fall back to parsing the Markdown rendering.
3) Build an in-memory list of tasks with fields (best-effort):

- `task_id` (TASK-001)
- `feature_id` (FEAT-014)
- `epic_id` (EPIC-003)
- `title`
- `description`
- `files` (list of file paths this task touches - IMPORTANT for grouping)
- `release_target` (MVP/V1/Full/Later)
- `priority` (P0/P1/P2)
- `estimate` (S/M/L)
- `dependencies` (task ids, if present)
- `tags` (backend/frontend/infra/qa/etc., if present)

4) Apply optional filters from remaining args:

- Release filter: MVP/V1/Full/Later
- Epic filter: EPIC-###
- Feature filter: FEAT-###

If the backlog file is missing, STOP and report the expected path.

---

## Step 2 — Find eligible candidate tasks

Eligible tasks are tasks that:

- exist in `tasks.md`
- are NOT already referenced by any existing WP
- are not obviously blocked by missing dependencies (best-effort)

Preference order (unless filters override):

1) `release_target: MVP` first, then V1, then Full, then Later
2) Within a release target:
   - priority P0 → P1 → P2
   - group by `epic_id` then `feature_id`
   - smaller estimates first (S then M then L), unless dependency chains require ordering

Dependency-aware selection (best-effort):

- If a task lists dependencies that are not already in any WP (any status) and not included in the current WP batch, treat it as blocked and skip.
- If dependencies are missing/unknown, be conservative: pick fewer tasks per WP.

If no eligible tasks are found, STOP and report why.

---

## Step 3 — Form appropriately sized Work Packages (WP batching heuristics)

Goal: small, focused WPs.

Default WP sizing targets:

- 3–8 tasks per WP (bias toward smaller counts unless tasks are tiny)
- Total effort per WP ~ 1–3 days (best-effort)
  - Heuristic points: S=1, M=2, L=4; aim for 4–8 points per WP

Batching heuristics (priority order):

1) **File-based grouping (HIGHEST PRIORITY):**
   - Tasks that touch the same file(s) should be in the same WP or consecutive WPs
   - Parse the `files` field from each task
   - Group tasks with overlapping file paths together
   - Example: If TASK-001 and TASK-005 both modify `src/core/base_collector.py`, put them in the same WP
   - This prevents multiple WPs modifying the same file and creating conflicts

2) **Module/folder grouping:**
   - Tasks in the same module/folder (e.g., all in `src/core/`) should be grouped when possible
   - Use PROJECT_ARCHITECTURE.md Quick Reference to understand module boundaries

3) Keep WPs within the same `feature_id` when possible.

4) If a feature is too large, allow spanning within the same `epic_id`, but keep it tight.

5) Prefer related tasks only if they share the same epic/feature (IDs alone are not a guarantee).

6) Avoid mixing unrelated tags (e.g., deep infra + UI polish) unless tasks are explicitly coupled.

7) Stop early if you hit a task that clearly depends on missing prerequisites.

8) If uncertain, create smaller WPs.

**Batching modes:**

**A) Custom task selection mode (`--tasks TASK-001,TASK-005,...`):**
- Parse the comma-separated task IDs
- Create ONE WP containing exactly those tasks
- Number the WP appropriately (next available WP-####)
- Skip the heuristic grouping logic
- If any specified task is already in a WP or doesn't exist, STOP and report the issue

**B) ALL mode (`ALL` keyword in arguments):**
- Process ALL eligible candidate tasks
- Repeat the batching heuristics until all eligible tasks are assigned to WPs
- Remove assigned tasks from the pool after each WP is formed
- Continue until no eligible tasks remain
- This creates as many WPs as needed to cover all tasks

**C) Count mode (integer `N` in arguments, or default to 1):**
- Repeat batching up to N times, removing selected tasks from the candidate pool each time
- Stop after N WPs are created OR when no eligible tasks remain (whichever comes first)

---

## Step 4 — Draft WP metadata

For each WP batch selected:

1) WP Title (short, readable):

- Prefer: `<EPIC title> — <Feature title> (slice)` if `features_backlog.md`/`epics_backlog.md` are available (fallback to `features.md`/`epics.md` if backlog missing)
- Otherwise: derive from dominant `feature_id`/`epic_id` + common tags
- Keep it human-scannable

2) Goal sentence:

- Outcome-oriented: what completing the WP enables.

3) WP Task list:

- List included Task IDs and task titles.

4) Plan Doc path (reference only; created later by a planning command):

- `docs/forge/ideas/<IDEA_ID>/planning/WPP-0001-WP-XXXX_TASK-AAA-BBB_<short_slug>.md`
  - `WPP-0001` is an incrementing plan-doc id local to the idea (best-effort).
  - `TASK-AAA-BBB` = numeric range (min/max) of included tasks
  - Slug: short + stable (e.g., `orchestration_api_slice`, `ui_control_panel_basics`)

5) Status:

- `Queued`

6) Dependencies (best-effort):

- If tasks depend on other tasks not already covered by any WP (any status) and not included in this WP, list them at WP level.
- Otherwise: `None`

7) Verify commands (best-effort defaults):

- Default: `pytest`
- If clearly frontend-only: include `npm test` or minimal build if known
- If unclear: keep only `pytest`

8) Traceability:

- Include `Idea-ID: <IDEA_ID>` in the WP entry so WPs are traceable back to the idea.

---

## Step 5 — Append to work_packages.md

Append each new WP section at the end.

Recommended WP entry format:

```md
## WP-XXXX — <Title>

- Status: Queued
- Idea-ID: <IDEA_ID>
- Release: MVP|V1|Full|Later
- Tasks:
  - TASK-001 — <title>
  - TASK-002 — <title>
- Goal: <goal sentence>
- Dependencies: None | WP-XXXX | TASK-YYY
- Plan Doc: docs/forge/ideas/<IDEA_ID>/planning/WPP-0001-WP-XXXX_TASK-AAA-BBB_<slug>.md
- Verify: pytest (and any extras)
```

---

## Step 6 — Output next actions

Print:

- New WP id(s) and tasks selected
- Plan Doc path(s)
- Suggested next step (e.g., “Run your WP planning command for WP-XXXX”)

---

## Non-negotiable Rules

- Never modify or rewrite the canonical backlog in `docs/forge/ideas/<IDEA_ID>/latest/tasks.md`.
- Never enqueue tasks already referenced by any existing WP (any status).
- Keep WPs small and focused; default to 1 WP if no count is provided.
- Do NOT mark tasks complete here.
- Prefer conservative batching when dependencies are unclear.
- Do not invent tasks; only select tasks that exist in `tasks.md`.
