import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import * as path from 'node:path';
import { ensureIdeaWorkspace } from './vfPaths.js';
import * as fs from 'node:fs/promises';

export function registerAppendLog(server: McpServer) {
  server.registerTool(
    'vf.append_log',
    {
      title: 'Append run log entry',
      description: 'Append an entry to docs/forge/ideas/<IDEA_ID>/run_log.md (append-only).',
      inputSchema: {
        idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
        stage: z.string().describe('Stage name (e.g. idea.normalize)'),
        run_id: z.string().optional().describe('Run id if available'),
        status: z.enum(['NEEDS_USER_INPUT', 'SUCCESS', 'SUCCESS_WITH_WARNINGS', 'FAILED']).describe('Status'),
        notes: z.array(z.string()).optional().describe('Bullets'),
        outputs: z.array(z.string()).optional().describe('Relative paths written'),
        repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
      },
    },
    async ({
      idea_id,
      stage,
      run_id,
      status,
      notes,
      outputs,
      repo_root,
    }: {
      idea_id: string;
      stage: string;
      run_id?: string;
      status: 'NEEDS_USER_INPUT' | 'SUCCESS' | 'SUCCESS_WITH_WARNINGS' | 'FAILED';
      notes?: string[];
      outputs?: string[];
      repo_root?: string;
    }) => {
      const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
      const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);

      const ts = new Date().toISOString();
      const lines: string[] = [];
      lines.push(`\n### ${ts} — ${stage}\n`);
      lines.push(`- Idea-ID: ${idea_id}\n`);
      if (run_id) lines.push(`- Run-ID: ${run_id}\n`);
      if (outputs?.length) {
        lines.push(`- Outputs:\n`);
        for (const o of outputs) lines.push(`  - ${o}\n`);
      }
      if (notes?.length) {
        lines.push(`- Notes:\n`);
        for (const n of notes) lines.push(`  - ${n}\n`);
      }
      lines.push(`- Status: ${status}\n`);

      await fs.appendFile(ws.runLogAbs, lines.join(''), 'utf8');

      return { content: [{ type: 'text', text: `Logged ${stage} (${status})` }] };
    }
  );
}
