---
name: vf.project.init
title: Project Init
description: Ensure the docs/forge/ structure exists for a project. (This repo doesn't modify code, only docs.)
inputs:
  idea_ref: string
---

Initialize forge docs for `<IDEA_ID>`.

## Resolve IDEA_ID (required)

Before using any paths, resolve the idea folder:

- Call `vf.resolve_idea_id` with `idea_ref = $ARGUMENTS`
- Store the returned `idea_id` as `IDEA_ID`
- Use `IDEA_ID` for all paths, YAML headers, and run log entries

Call:
1) vf.resolve_idea_id with idea_ref=$ARGUMENTS (capture IDEA_ID)
2) vf.ensure_idea_workspace (idea_id=<IDEA_ID>)

Then write a short note to `latest/README.md` under the idea root explaining what lives in inputs/, latest/, runs/, and how to use run_log.md.

Finally, append a run_log entry with stage=project.init and status=SUCCESS.
