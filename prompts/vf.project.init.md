---
name: vf.project.init
title: Project Init
description: Ensure the docs/forge/ structure exists for a project. (This repo doesn't modify code, only docs.)
inputs:
  idea_id: string
---

Initialize forge docs for `{{idea_id}}`.

Call:
1) vf.ensure_idea_workspace (idea_id={{idea_id}})

Then write a short note to `latest/README.md` under the idea root explaining what lives in inputs/, latest/, runs/, and how to use run_log.md.

Finally, append a run_log entry with stage=project.init and status=SUCCESS.
