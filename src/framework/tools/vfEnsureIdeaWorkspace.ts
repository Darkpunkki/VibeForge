import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import * as path from 'node:path';
import { ensureIdeaWorkspace } from './vfPaths.js';

export function registerEnsureIdeaWorkspace(server: McpServer) {
  server.registerTool(
    'vf.ensure_idea_workspace',
    {
      title: 'Ensure idea workspace',
      description:
        'Ensures docs/forge/ideas/<IDEA_ID>/ exists with inputs/, latest/, runs/, and creates per-idea manifest.md and run_log.md if missing.',
      inputSchema: {
        idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
        repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
      },
    },
    async ({ idea_id, repo_root }: { idea_id: string; repo_root?: string }) => {
      const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
      const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);

      return {
        content: [{ type: 'text', text: `Workspace ready for ${ws.ideaId}` }],
        structuredContent: ws,
      };
    }
  );
}
