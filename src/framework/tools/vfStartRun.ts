import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { ensureIdeaWorkspace } from './vfPaths.js';

function makeRunId(now = new Date()): string {
  // Windows-safe ISO-ish
  const iso = now.toISOString().replaceAll(':', '-');
  const rand = Math.random().toString(16).slice(2, 6);
  return `${iso}_run-${rand}`;
}

export function registerStartRun(server: McpServer) {
  server.registerTool(
    'vf.start_run',
    {
      title: 'Start a run',
      description: 'Creates docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/ and returns RUN_ID + useful paths.',
      inputSchema: {
        idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
        label: z.string().optional().describe('Optional label for humans (stored in notes).'),
        repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
      },
    },
    async ({
      idea_id,
      label,
      repo_root,
    }: {
      idea_id: string;
      label?: string;
      repo_root?: string;
    }) => {
      const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
      const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);

      const runId = makeRunId();
      const runAbs = path.join(ws.runsAbs, runId);
      const outputsAbs = path.join(runAbs, 'outputs');
      const validationsAbs = path.join(runAbs, 'validations');

      await fs.mkdir(outputsAbs, { recursive: true });
      await fs.mkdir(validationsAbs, { recursive: true });

      const notesAbs = path.join(runAbs, 'notes.md');
      const header = `# Run Notes — ${ws.ideaId}\n\n- run_id: ${runId}\n- label: ${label ?? ''}\n- created_at: ${new Date().toISOString()}\n`;
      await fs.writeFile(notesAbs, header, 'utf8');

      return {
        content: [{ type: 'text', text: `Run started: ${runId}` }],
        structuredContent: { runId, runAbs, outputsAbs, validationsAbs, notesAbs },
      };
    }
  );
}
