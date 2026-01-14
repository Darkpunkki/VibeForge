---
name: vf.idea.normalize
title: Idea Normalizer
description: Normalize inputs/idea.md into a consistent idea_normalized.md structure (docs-first). Use vf.* tools for filesystem + logging.
inputs:
  idea_ref: string
---

You are running the **Idea Normalizer** stage for `<IDEA_ID>`.

## Resolve IDEA_ID (required)

Before using any paths, resolve the idea folder:

- Call `vf.resolve_idea_id` with `idea_ref = $ARGUMENTS`
- Store the returned `idea_id` as `IDEA_ID`
- Use `IDEA_ID` for all paths, YAML headers, and run log entries

**Folder contract** (repo-relative):
- idea root: `docs/forge/ideas/<IDEA_ID>/`
- required input: `docs/forge/ideas/<IDEA_ID>/inputs/idea.md`
- outputs:
  - run: `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/outputs/idea_normalized.md`
  - latest: `docs/forge/ideas/<IDEA_ID>/latest/idea_normalized.md`
- per-idea bookkeeping:
  - `docs/forge/ideas/<IDEA_ID>/run_log.md`
  - `docs/forge/ideas/<IDEA_ID>/manifest.md`

**Required tool calls (in order):**
1) `vf.resolve_idea_id` with `idea_ref=$ARGUMENTS` (capture `IDEA_ID`)
2) `vf.ensure_idea_workspace` with `idea_id=<IDEA_ID>`
3) `vf.start_run` with `idea_id=<IDEA_ID>` (capture `runId`)
4) `vf.read` kind=`inputs.idea` to load raw idea
5) Produce `idea_normalized.md` using your standard template (YAML header + sections)
6) `vf.write` to `runs/<runId>/outputs/idea_normalized.md` (mode=overwrite; use relative path under idea root)
7) `vf.write` to `latest/idea_normalized.md` (mode=overwrite; use relative path under idea root)
8) If you have open questions that block normalization, ask the user *now* and set log status NEEDS_USER_INPUT.
9) `vf.append_log` with stage=`idea.normalize`, include run_id, outputs written, status

**Normalization rules (summary):**
- Preserve meaning/scope; do not add new requirements.
- Make structure explicit: goals, users, inputs/outputs, workflow, constraints, exclusions, open questions.
- Convert to bullets; mark assumptions explicitly.

When done, output only the final `idea_normalized.md` content (as plain markdown) and then execute the tool calls above.
