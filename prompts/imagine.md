---
name: Imagine
description: Imagine (Idea Intake) — Start or refine an idea. If given free-form text, create a new IDEA-XXXX folder, ask clarifying questions, draft idea.md, then (after user review) save to inputs/idea.md and log the run.
argument-hint: >-
  <initial idea text OR existing IDEA_ID> (examples: build a docs-first backlog generator | IDEA-0007-my-idea)
disable-model-invocation: false
---

# Imagine — Idea Intake (Interactive)

## Invocation

Run this command with either:

- **A free-form initial idea** (recommended):
  - `/imagine <initial idea text...>`

OR

- An **existing idea folder id** to refine the current idea:
  - `/imagine <IDEA_ID>`

Where:

- `$ARGUMENTS` may contain spaces if you pass an initial idea text.
- If `$ARGUMENTS` is empty, STOP and ask the user to rerun with an initial idea (or an IDEA_ID).

---

## Goal

Turn a rough idea into a **first, reviewable** `idea.md` stored at:

- `docs/forge/ideas/<IDEA_ID>/inputs/idea.md`

This command is **interactive** by default:
- Phase 1: draft an idea.md + ask clarifying questions 
- Phase 2: after user replies, save the final `idea.md` and capture answers for future stages

---

## Canonical paths (repo-relative)

Ideas root:

- `docs/forge/ideas/`

Per-idea root:

- `docs/forge/ideas/<IDEA_ID>/`

Inputs:

- `docs/forge/ideas/<IDEA_ID>/inputs/idea.md` (final target)
- `docs/forge/ideas/<IDEA_ID>/inputs/imagine_questions.md` (generated)
- `docs/forge/ideas/<IDEA_ID>/inputs/imagine_answers.md` (captured; append-only)

History:

- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/imagine_questions.md`
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/idea_draft.md`
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/idea_final.md`

Per-idea logs:

- `docs/forge/ideas/<IDEA_ID>/run_log.md` (append-only)
- `docs/forge/ideas/<IDEA_ID>/manifest.md` (rolling status)

---

## Directory handling

Ensure these directories exist (create them if missing):

- `docs/forge/ideas/`
- `docs/forge/ideas/<IDEA_ID>/inputs/`
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/`

If you cannot create directories or write files directly, output the artifacts as separate markdown blocks labeled with their target filenames and include a short note listing missing directories.

---

## Step 0 — Resolve or create IDEA_ID

### If `$ARGUMENTS` looks like an IDEA folder id

Treat as existing idea:

- Recognize an IDEA_ID by: it starts with `IDEA-` and contains no spaces.

Set:

- `IDEA_ID = $ARGUMENTS`

Then:

- If `docs/forge/ideas/<IDEA_ID>/inputs/idea.md` exists, use it as the base idea.
- If it does not exist, proceed as a new idea but keep the provided IDEA_ID.

### Otherwise (free-form text)

Treat `$ARGUMENTS` as **initial idea text** and create a new folder.

1) Determine the next numeric id:
   - List folders under `docs/forge/ideas/` matching `IDEA-????-*`
   - Find the highest `????` as an integer
   - Next id = highest + 1 (start at `0001` if none exist)

2) Create a slug from the idea (filesystem-safe):
   - lowercase
   - replace spaces with hyphens
   - remove non-alphanumeric characters except `-`
   - collapse multiple hyphens
   - limit to ~40 characters

3) Set:
   - `IDEA_ID = IDEA-<NEXT_4_DIGITS>-<slug>`

---

## Step 1 — Create the idea workspace (if missing)

Ensure per-idea files exist:

- `docs/forge/ideas/<IDEA_ID>/run_log.md` (create if missing; can start empty)
- `docs/forge/ideas/<IDEA_ID>/manifest.md` (create if missing; template below)

---

## Step 2 — Run identity

Generate:

- `RUN_ID` as a filesystem-safe id (Windows-safe, no `:`), e.g.:
  - `2026-01-14T05-22-41Z_imagine-8f3c`

Also capture:

- `generated_at` as ISO-8601 time (may include timezone offset)

---

## Step 3 — Gather context

### If refining an existing idea
Include file contents in context:

- Existing idea (if present):
  @docs/forge/ideas/<IDEA_ID>/inputs/idea.md

### If creating a new idea
Use `$ARGUMENTS` (initial idea text) as the base.

---

## Step 4 — Produce clarifying questions

Create **5–12 questions**, optimized to reduce ambiguity without over-scoping.

Guidance:
- Prefer questions that resolve: target user, core problem, non-goals, constraints, MVP vs later, inputs/outputs.
- Avoid implementation rabbit holes unless the idea explicitly mentions them.
- If the idea implies a framework/tooling product, ask about: audience, intended workflow, what “done” looks like.

Write questions to:
- `docs/forge/ideas/<IDEA_ID>/inputs/imagine_questions.md` (overwrite allowed)
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/imagine_questions.md`

---

## Step 5 — Draft `idea.md` (REVIEWABLE)

Create a **draft** idea document based on:
- the base idea (existing idea.md or initial text)
- reasonable assumptions clearly marked
- TODO markers where answers are needed

Write draft to:
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/idea_draft.md`

Do NOT write to `inputs/idea.md` yet.

---

## Step 6 — Ask the user and stop (Phase 1)

In chat, present:

1) The generated questions as a numbered list.
2) A short note: “Reply with answers in the same numbered format. Optionally include edits to the draft idea.”
3) Also present the **draft idea** (or a short summary + tell where it was saved, depending on tool limits).

Then append a run_log entry with:

- Status: `NEEDS_USER_INPUT`
- Run-ID: `<RUN_ID>`
- Outputs so far: `inputs/imagine_questions.md`, `runs/<RUN_ID>/idea_draft.md`

STOP and wait for the user reply.

---

## Phase 2 — Capture answers, finalize `inputs/idea.md`

When the user replies:

### Step 7 — Persist answers (append-only)

Append the user’s answers to:

- `docs/forge/ideas/<IDEA_ID>/inputs/imagine_answers.md`

Format:

```md
### <ISO-8601> — Answers for <RUN_ID>

<user answers verbatim, lightly formatted if needed>
```

---

### Step 8 — Produce final `idea.md`

Update the draft by incorporating answers:

- Replace TODOs with decisions
- Move information into correct sections
- Keep scope stable; do not add new requirements beyond what the user confirmed
- If something remains unclear, keep it in an “Open Questions” section (but keep it short)

Write final to BOTH:
- `docs/forge/ideas/<IDEA_ID>/inputs/idea.md` (overwrite allowed)
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/idea_final.md`

---

### Step 9 — Update logs + manifest

Append a SUCCESS entry to:
- `docs/forge/ideas/<IDEA_ID>/run_log.md`

And create/update manifest:
- if `manifest.md` exists, update only the keys under `Idea` section

---

## Output Format: `idea.md` (Markdown + YAML header)

Write `idea.md` with a YAML header followed by sections.

### YAML header (example)

```yaml
---
doc_type: idea
idea_id: "<IDEA_ID>"
generated_by: "Imagine (Idea Intake)"
generated_at: "<ISO-8601>"
run_id: "<RUN_ID>"
source:
  - "user_input ($ARGUMENTS or existing inputs/idea.md)"
qa:
  questions: "inputs/imagine_questions.md"
  answers: "inputs/imagine_answers.md (appended)"
status: "Draft"
---
```

### Recommended sections

# Idea

## One-liner

(1 sentence)

## Problem / Motivation

- ...

## Target Users

- ...

## Goals

- ...

## Non-Goals

- ...

## Constraints

- ...

## Inputs

- ...

## Outputs

- ...

## High-level Workflow

1. ...
2. ...

## Success Criteria

- ...

## Open Questions (if any)

- ...

---

## Logging Requirements: `run_log.md` (append-only)

Append entries with this shape:

### Phase 1 (needs input)

```md
### <ISO-8601 timestamp> — Imagine (Idea Intake)

- Idea-ID: <IDEA_ID>
- Run-ID: <RUN_ID>
- Mode: new | refine
- Inputs:
  - user_input ($ARGUMENTS) OR inputs/idea.md (if refining)
- Outputs:
  - inputs/imagine_questions.md
  - runs/<RUN_ID>/imagine_questions.md
  - runs/<RUN_ID>/idea_draft.md
- Status: NEEDS_USER_INPUT
- Notes:
  - <1–3 bullets on main unknowns>
```

### Phase 2 (finalized)

```md
### <ISO-8601 timestamp> — Imagine (Idea Intake) — Finalize

- Idea-ID: <IDEA_ID>
- Run-ID: <RUN_ID>
- Outputs:
  - inputs/imagine_answers.md (appended)
  - inputs/idea.md
  - runs/<RUN_ID>/idea_final.md
- Status: SUCCESS | SUCCESS_WITH_WARNINGS | FAILED
- Notes:
  - <1–5 bullets on key decisions captured>
```

---

## Manifest template (if creating new)

```md
# Manifest — <IDEA_ID>

## Idea

- idea_status: Draft
- last_updated: <YYYY-MM-DD>
- last_run_id: <RUN_ID>
- latest_inputs:
  - inputs/idea.md
  - inputs/imagine_questions.md
  - inputs/imagine_answers.md
- notes:
  - <optional bullets>
```

---

## Failure handling

If the initial idea is extremely short/vague:

- Still generate questions
- Draft `idea.md` with placeholders/TODOs
- Do not invent details
