---
name: plan-wp
description: Create detailed execution plans for Work Packages from work_packages.md (reads WP board, writes plan docs to planning/)
argument-hint: "<IDEA_ID> [WP-####|ALL|QUEUED]   (examples: IDEA-0001-my-idea ALL | IDEA-0001-my-idea WP-0003 | IDEA-0001-my-idea QUEUED)"
disable-model-invocation: true
---

# Work Package Planning Assistant (Idea-Scoped)

Create detailed execution plans for Work Packages.

This command reads from:
- `docs/forge/ideas/<IDEA_ID>/latest/work_packages.md` (WP board with task references)
- `docs/forge/ideas/<IDEA_ID>/latest/tasks.md` (canonical task definitions)

And writes plan documents to:
- `docs/forge/ideas/<IDEA_ID>/planning/WPP-XXXX-WP-YYYY_<slug>.md`

**Usage:**
- `/plan-wp IDEA-0002-finder ALL` → create plans for all WPs that don't have plans yet
- `/plan-wp IDEA-0002-finder QUEUED` → create plans for queued WPs only (default)
- `/plan-wp IDEA-0002-finder WP-0003` → create plan for a specific WP

---

## Resolve IDEA_ID (required)

Before using any paths:
- Parse `IDEA_REF` from first token of `$ARGUMENTS`
- Call `vf.resolve_idea_id` with `idea_ref = IDEA_REF`
- Store the returned `idea_id` as `IDEA_ID`
- Use `IDEA_ID` for all paths, YAML headers, and run log entries

---

## Invocation Modes

Parse remaining tokens in `$ARGUMENTS` after IDEA_REF:

**A) Specific WP:** `WP-####`
- Create plan for that WP only

**B) ALL:**
- Create plans for all WPs that don't have plan docs yet
- Skip WPs that already have plans

**C) QUEUED (default if no mode specified):**
- Create plans for WPs with status `Queued` that don't have plan docs yet

---

## Canonical paths (repo-relative)

Inputs:
- `docs/forge/ideas/<IDEA_ID>/latest/work_packages.md` (required - WP board)
- `docs/forge/ideas/<IDEA_ID>/latest/tasks.md` (required - task definitions)
- `docs/forge/ideas/<IDEA_ID>/latest/features_backlog.md` (optional context)
- `docs/forge/ideas/<IDEA_ID>/latest/epics_backlog.md` (optional context)
- `docs/forge/ideas/<IDEA_ID>/latest/PROJECT_ARCHITECTURE.md` (optional - Quick Reference only)

Outputs:
- `docs/forge/ideas/<IDEA_ID>/planning/` (plan docs directory)
- `docs/forge/ideas/<IDEA_ID>/run_log.md` (append-only log)

---

## Context (loading sequence)

Load files in this order, handling missing optional files gracefully:

### Required files
1. Read `latest.work_packages` using vf.read (STOP if missing)
2. Read `latest.tasks` using vf.read (STOP if missing)

### Optional context
3. Optionally read `latest.features_backlog` (or fallback `latest.features`)
4. Optionally read `latest.epics_backlog` (or fallback `latest.epics`)
5. Optionally read `latest.PROJECT_ARCHITECTURE` (Quick Reference only)

**Important:** Use vf.read with kind notation. Handle ENOENT gracefully for optional files.

---

## Step 1 — Parse WP Board and Select Target WPs

1) Parse `work_packages.md`:
   - Extract all WP entries with: id, title, status, task list, goal, dependencies, verify commands, plan doc path (if present)

2) Determine which WPs need plans based on invocation mode:
   - **Specific WP mode:** Select that WP only
   - **ALL mode:** Select all WPs without plan docs
   - **QUEUED mode:** Select WPs with status `Queued` without plan docs

3) For each selected WP, check if plan doc already exists:
   - If `Plan Doc:` field is present in WP entry, check if that file exists
   - If no `Plan Doc:` field, derive default path and check if it exists
   - Skip WPs that already have plans (unless specific WP was requested)

4) If no WPs need plans, report and STOP.

---

## Step 2 — Load Canonical Tasks for Each WP

For each WP needing a plan:

1) Parse task IDs from the WP entry
2) Load full task details from `tasks.md` for each task ID:
   - Title, description, files, acceptance criteria
   - Dependencies, release target, priority, estimate
3) If any task ID is not found in tasks.md, record as blocker and skip this WP

---

## Step 3 — Determine Execution Order (Cross-WP Analysis)

Consider ALL WPs (not just the ones being planned) to understand dependencies:

1) Build dependency graph:
   - Task-level dependencies (from tasks.md)
   - WP-level dependencies (from work_packages.md)

2) For each WP being planned, determine:
   - Which tasks must be done first (based on dependencies)
   - Optimal order within the WP (dependencies, file grouping, logical flow)
   - Blockers from other WPs (if any)

3) Suggest implementation order if multiple WPs are being planned:
   - "Recommend executing WPs in this order: WP-0001, WP-0003, WP-0002 (based on dependencies)"

---

## Step 4 — Generate Plan Doc for Each WP

For each WP, create a plan document with:

### Header
```markdown
# WP-XXXX — <WP Title>

**Idea-ID:** <IDEA_ID>
**Status:** Planned
**Created:** <YYYY-MM-DD>

## Goal

<Goal from work_packages.md>

## Tasks Included

- TASK-001: <title>
- TASK-005: <title>
- TASK-007: <title>

## Dependencies

<WP-level and task-level dependencies>
```

### Ordered Execution Steps

```markdown
## Execution Plan

### Phase 1: <Phase name> (Tasks: TASK-001, TASK-002)

**Order rationale:** <Why this order - dependencies, file grouping, logical flow>

1. **TASK-001: <title>**
   - Files: `src/core/base.py`, `tests/test_base.py`
   - Acceptance: <key criteria from task>
   - Notes: <Implementation hints, gotchas, patterns to follow>

2. **TASK-002: <title>**
   - Files: `src/core/collector.py`
   - Acceptance: <key criteria>
   - Notes: <hints>

### Phase 2: <Phase name> (Tasks: TASK-005)
...
```

### Verification & Done Criteria

```markdown
## Done Means

- [ ] All tasks completed (see checklist below)
- [ ] Verification commands pass
- [ ] No new failing tests
- [ ] Code follows architecture patterns

## Task Checklist

- [ ] TASK-001: <title>
  - Key files: `src/core/base.py`
  - Verified: <verification method>
- [ ] TASK-002: <title>
  - Key files: `src/core/collector.py`
  - Verified: <verification method>

## Verification Commands

```bash
<commands from work_packages.md verify field, or defaults like pytest>
```

## Notes / Decisions

<Empty section for capturing decisions during execution>
```

---

## Step 5 — Write Plan Docs and Update WP Board

For each plan doc created:

1) **Determine plan doc path:**
   - If WP entry has explicit `Plan Doc:` field, use that path
   - Otherwise, derive: `docs/forge/ideas/<IDEA_ID>/planning/WPP-<NEXT>-WP-XXXX_TASK-AAA-BBB_<slug>.md`
     - WPP-<NEXT> is an incrementing plan doc ID (check existing files in planning/ to get next number)
     - TASK-AAA-BBB is the numeric range of tasks in this WP
     - Slug is derived from WP title (lowercase, hyphens, ~20 chars max)

2) **Write plan doc** using vf.write with mode='overwrite'

3) **Update work_packages.md entry** for this WP:
   - If `Plan Doc:` field is missing, add it with the plan doc path
   - If `Status:` is still `Queued`, keep it (don't change)
   - Use vf.write with mode='overwrite' for the whole work_packages.md file

4) **Create planning/ directory** if it doesn't exist (best-effort via bash mkdir -p or note it)

---

## Step 6 — Log and Report

1) Append entry to `run_log.md`:

```markdown
### <ISO-8601 timestamp> — Plan WP

- Idea-ID: <IDEA_ID>
- Mode: <ALL|QUEUED|WP-XXXX>
- Plans created: <count>
  - WP-0001: <plan doc path>
  - WP-0003: <plan doc path>
- Skipped (already planned): <count>
- Blocked (missing tasks): <count>
- Status: SUCCESS
```

2) Report summary to user:
   - Which WPs got plans
   - Suggested execution order if multiple WPs
   - Next step: `/work-wp <IDEA_ID>` to execute the next queued WP with a plan

---

## Non-negotiable Rules

- Only create plans for WPs that exist in work_packages.md
- Never modify tasks.md (read-only)
- Plan docs are detailed guides, not code
- Use task IDs exactly as they appear in tasks.md
- Update work_packages.md with Plan Doc paths after creating plans
- Suggest execution order based on dependencies, but don't enforce it

---

## Quality Checks

- Every task referenced by the WP is found in tasks.md
- Execution order respects task dependencies
- File paths are consistent with PROJECT_ARCHITECTURE.md (if available)
- Verification commands are appropriate for the tasks
- Plan doc paths follow naming convention

---
