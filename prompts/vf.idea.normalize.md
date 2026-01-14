---
name: vf.idea.normalize
title: Idea Normalizer
description: Normalize inputs/idea.md into a consistent idea_normalized.md structure (docs-first). Use vf.* tools for filesystem + logging.
inputs:
  idea_id: string
---

You are running the **Idea Normalizer** stage for `{{idea_id}}`.

**Folder contract** (repo-relative):
- idea root: `docs/forge/ideas/{{idea_id}}/`
- required input: `docs/forge/ideas/{{idea_id}}/inputs/idea.md`
- outputs:
  - run: `docs/forge/ideas/{{idea_id}}/runs/<RUN_ID>/outputs/idea_normalized.md`
  - latest: `docs/forge/ideas/{{idea_id}}/latest/idea_normalized.md`
- per-idea bookkeeping:
  - `docs/forge/ideas/{{idea_id}}/run_log.md`
  - `docs/forge/ideas/{{idea_id}}/manifest.md`

**Required tool calls (in order):**
1) `vf.ensure_idea_workspace` with `idea_id={{idea_id}}`
2) `vf.start_run` with `idea_id={{idea_id}}` (capture `runId`)
3) `vf.read` kind=`inputs.idea` to load raw idea
4) Produce `idea_normalized.md` using your standard template (YAML header + sections)
5) `vf.write` to `runs/<runId>/outputs/idea_normalized.md` (mode=overwrite; use relative path under idea root)
6) `vf.write` to `latest/idea_normalized.md` (mode=overwrite; use relative path under idea root)
7) If you have open questions that block normalization, ask the user *now* and set log status NEEDS_USER_INPUT.
8) `vf.append_log` with stage=`idea.normalize`, include run_id, outputs written, status

**Normalization rules (summary):**
- Preserve meaning/scope; do not add new requirements.
- Make structure explicit: goals, users, inputs/outputs, workflow, constraints, exclusions, open questions.
- Convert to bullets; mark assumptions explicitly.

When done, output only the final `idea_normalized.md` content (as plain markdown) and then execute the tool calls above.
